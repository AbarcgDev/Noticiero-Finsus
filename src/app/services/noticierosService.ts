import { NoticiasService } from "./noticiasService.js";
import Noticiero, { NoticieroFields, NoticieroState } from "../models/Noticiero.js";
import { Noticia } from "../models/Noticia.js";
import AiPrompts from "../utils/AiPrompts.json" with { type: "json" };
import { GoogleGenerativeAI } from "@google/generative-ai";
import NoticieroMySqlRepository from "../persist/noticierosMySqlRepo.js";
import { INoticierosRepository } from "../persist/repository/INoticierosRepository.js";

export class NoticieroService {
    private noticiasService: NoticiasService;
    private noticierosRepository: INoticierosRepository;
    private apiKey: string;

    constructor() {
        this.noticiasService = new NoticiasService();
        this.noticierosRepository = new NoticieroMySqlRepository();
        this.apiKey = process.env.GEMINI_API_KEY || '';
    }

    async generateNoticieroDraft(): Promise<Noticiero> {
        const noticias = await this.noticiasService.fetchLatestNews();
        const noticiero = this.noticierosRepository.create({
            title: 'Noticiero Finsus ' + new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
            guion: await this.generateGuionWithAI(noticias, this.apiKey),
            state: NoticieroState.PENDING,
            publicationDate: new Date(),
        });
        return noticiero;
    }

    async getAllNoticieros(): Promise<Noticiero[]> {
        return this.noticierosRepository.findAll();
    }

    async getNoticieroById(id: string): Promise<Noticiero | null> {
        return this.noticierosRepository.findById(id);
    }

    async updateNoticiero(id: string, noticieroData: Partial<NoticieroFields>): Promise<Noticiero | null> {
        return this.noticierosRepository.update(id, noticieroData);
    }

    async deleteNoticiero(id: string): Promise<boolean> {
        return this.noticierosRepository.delete(id);
    }

    async publishNoticiero(id: string): Promise<Noticiero | null> {
        return this.noticierosRepository.update(id, { state: NoticieroState.PUBLISHED });
    }

    async rejectNoticiero(id: string): Promise<Noticiero | null> {
        return this.noticierosRepository.update(id, { state: NoticieroState.REJECTED });
    }

    /**
     * Get the latest published noticiero
     * @returns The latest published noticiero or null if none found
     */
    async getLatestPublishedNoticiero(): Promise<Noticiero | null> {
        const noticieros = await this.noticierosRepository.findPublished();

        // Sort by publicationDate in descending order and get the first one
        const latest = noticieros
            .sort((a, b) =>
                new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
            )[0];

        return latest || null;
    }

    private async generateGuionWithAI(noticias: Noticia[], apiKey: string): Promise<string> {
        const guionContent = await this.callTextGenerationService(this.generatePrompt(noticias), apiKey);
        return [
            AiPrompts.bienvenida.join("\n\n"),
            guionContent,
            AiPrompts.despedida.join("\n\n")
        ].join("\n\n");
    }

    private generatePrompt(noticias: Noticia[]): string {
        const prompt = [
            AiPrompts.guionNoticiero.context.join("\n"),
            AiPrompts.guionNoticiero.instruction.join("\n"),
            noticias.map((n: Noticia) => {
                return `
              TITULO: ${n.title}
              CONTENIDO: ${n.content}
              FUENTE: ${n.source}
            `
            }
            ).join("\n\n"),
        ].join("\n\n")
        return prompt;
    }

    private async callTextGenerationService(prompt: string, apiKey: string): Promise<string> {
        const gemini = new GoogleGenerativeAI(apiKey)
        const maxRetries = 3;
        let attempts = 0;
        while (attempts < maxRetries) {
            try {
                const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
                console.info("Generando texto con Gemini, modelo: gemini-2.5-flash")
                const response = await model.generateContent(prompt);
                const result = response.response.text()
                if (!result) {
                    throw new Error("El modelo no devolvio texto valido")
                }
                return result;
            }
            catch (e) {
                console.error("Error generando texto: ", e)
                attempts++;
                if (attempts >= maxRetries) {
                    throw new Error("Fallo en la generacion de texto por IA")
                }
            }
        }
        return "";
    }

}
