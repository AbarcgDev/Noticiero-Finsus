import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { promisify } from "util";
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { FileStorageService } from "./fileStorageService";
import AiPrompts from "../utils/AiPrompts.json" with { type: "json" };

export class AudioGenerationService {
    private apiKey: string;
    private fileStorageService: FileStorageService;

    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
        this.fileStorageService = new FileStorageService();
    }

    async generateAudio(noticieroId: string, content: string): Promise<void> {
        console.log("Generando audio para noticiero: " + noticieroId);
        try {
            // Obtener el audio WAV en base64 de la API
            const audioBase64 = await this.generateAudioWithAI(
                AiPrompts.audioNoticiero.instruction.join('\n'),
                content,
                this.apiKey
            );

            // Convertir de base64 a buffer
            let audioBuffer = Buffer.from(audioBase64, 'base64');

            // Verificar los primeros bytes para el formato
            console.log('Audio buffer length:', audioBuffer.length);
            console.log('First 8 bytes:', audioBuffer.subarray(0, 8).toString('hex'));

            // Verificar si ya tiene encabezado WAV (RIFF)
            if (audioBuffer.length < 12 || audioBuffer.toString('utf8', 0, 4) !== 'RIFF') {
                console.log('El audio no tiene un encabezado WAV válido, intentando agregarlo...');
                // Crear un nuevo buffer con el encabezado WAV
                const header = Buffer.alloc(44);
                header.write('RIFF');
                header.writeUInt32LE(audioBuffer.length + 36, 4); // Tamaño total del archivo - 8
                header.write('WAVEfmt ', 8, 8, 'ascii');
                header.writeUInt32LE(16, 16); // Tamaño del formato (16 para PCM)
                header.writeUInt16LE(1, 20);  // Formato de audio (1 = PCM)
                header.writeUInt16LE(1, 22);  // Canales (1 = mono)
                header.writeUInt32LE(24000, 24); // Frecuencia de muestreo (24kHz)
                header.writeUInt32LE(48000, 28); // Bytes por segundo (24000 * 2)
                header.writeUInt16LE(2, 32);     // Alineación de bloque (2 bytes por muestra)
                header.writeUInt16LE(16, 34);    // Bits por muestra (16 bits)
                header.write('data', 36, 4, 'ascii');
                header.writeUInt32LE(audioBuffer.length, 40); // Tamaño de los datos

                // Combinar el encabezado con los datos de audio
                audioBuffer = Buffer.concat([header, audioBuffer]);
                console.log('Se agregó encabezado WAV al audio');
            }

            // Guardar el WAV temporal para depuración
            const debugPath = path.join(process.cwd(), 'debug_audio.wav');
            await fs.promises.writeFile(debugPath, audioBuffer);
            console.log('Audio guardado para depuración en:', debugPath);

            // Convertir WAV a MP3
            const mp3Buffer = await this.convertWavToMp3(audioBuffer);

            // Guardar el archivo MP3
            await this.fileStorageService.uploadAudioFile(noticieroId, mp3Buffer);
            console.log("Audio generado y guardado para noticiero: " + noticieroId);
        } catch (error) {
            console.error("Error en generateAudio:", error);
            throw error;
        }
    }

    private async generateAudioWithAI(instruction: string, content: string, apiKey: string): Promise<string> {
        try {
            const gemini = new GoogleGenAI({ apiKey: apiKey })
            const response: GenerateContentResponse = await gemini.models.generateContent({
                model: "gemini-2.5-pro-preview-tts",
                contents: [{ parts: [{ text: instruction + "\n\n" + content, }] }],
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        multiSpeakerVoiceConfig: {
                            speakerVoiceConfigs: [
                                {
                                    speaker: 'FINEAS',
                                    voiceConfig: {
                                        prebuiltVoiceConfig: { voiceName: 'Charon' }
                                    }
                                },
                                {
                                    speaker: 'SUSANA',
                                    voiceConfig: {
                                        prebuiltVoiceConfig: { voiceName: 'Leda' }
                                    }
                                }
                            ]
                        }
                    }
                }
            })
            const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;

            if (!base64Data) {
                throw new Error('No audio data generated');
            }

            return base64Data;
        } catch (error) {
            console.error("Error generating audio with AI:", error);
            throw error;
        }
    }

    private async convertWavToMp3(wavBuffer: Buffer): Promise<Buffer> {
        // Configurar la ruta de ffmpeg
        const ffmpegPath = '/usr/bin/ffmpeg';

        // Verificar si ffmpeg está disponible
        try {
            await fs.promises.access(ffmpegPath, fs.constants.X_OK);
        } catch (error) {
            console.error('FFmpeg is not installed or not executable at', ffmpegPath);
            throw new Error(`FFmpeg is not available at ${ffmpegPath}. Please ensure FFmpeg is installed in the container.`);
        }

        // Crear archivos temporales
        const tempDir = tmpdir();
        const tempWavPath = path.join(tempDir, `temp-${Date.now()}.wav`);
        const tempMp3Path = path.join(tempDir, `output-${Date.now()}.mp3`);

        try {
            // Escribir el buffer WAV a un archivo temporal
            await fs.promises.writeFile(tempWavPath, wavBuffer);

            // Configurar ffmpeg con opciones explícitas
            await new Promise<void>((resolve, reject) => {
                const command = ffmpeg(tempWavPath)
                    .setFfmpegPath(ffmpegPath)
                    .inputOptions([
                        '-f wav'  // Forzar formato de entrada WAV
                    ])
                    .audioCodec('libmp3lame')
                    .audioBitrate('128k')
                    .audioChannels(1)
                    .audioFrequency(24000)
                    .outputOptions([
                        '-ar 24000',  // Frecuencia de muestreo de salida
                        '-ac 1',      // Mono
                        '-b:a 128k'   // Bitrate de audio
                    ])
                    .output(tempMp3Path)
                    .on('end', resolve)
                    .on('error', (err) => {
                        console.error('FFmpeg error:', err);
                        reject(err);
                    })
                    .run();
            });

            // Leer el archivo MP3 resultante
            const mp3Buffer = await fs.promises.readFile(tempMp3Path);
            return mp3Buffer;
        } catch (error) {
            console.error('Error converting WAV to MP3:', error);
            throw error;
        } finally {
            // Limpiar archivos temporales
            try {
                await fs.promises.unlink(tempWavPath).catch(() => { });
                await fs.promises.unlink(tempMp3Path).catch(() => { });
            } catch (cleanupError) {
                console.error('Error cleaning up temporary files:', cleanupError);
            }
        }
    }
}