import { NoticiasService } from "./noticiasService.js";
import Noticiero, { NoticieroFields, NoticieroState } from "../models/Noticiero.js";
import { Noticia } from "../models/Noticia.js";
import AiPrompts from "../utils/AiPrompts.json" with { type: "json" };
import { GoogleGenerativeAI } from "@google/generative-ai";
import NoticieroMySqlRepository from "../persist/noticierosMySqlRepo.js";
import { INoticierosRepository } from "../persist/repository/INoticierosRepository.js";
import { ConfigurationService } from "../services/configurationService.js";
import { IAConfigurationFields } from "../models/IAConfiguration.js";

export class NoticieroService {
    private noticiasService: NoticiasService;
    private noticierosRepository: INoticierosRepository;
    private apiKey: string;
    private configurationService: ConfigurationService;
    private aiConfig: Omit<IAConfigurationFields, 'id'>;

    constructor() {
        this.noticiasService = new NoticiasService();
        this.noticierosRepository = new NoticieroMySqlRepository();
        this.apiKey = process.env.GEMINI_API_KEY || '';
        this.configurationService = new ConfigurationService();
    }

    private async initConfig(): Promise<void> {
        this.aiConfig = {
            malePresenter: (await this.configurationService.getMalePresenter()).toUpperCase(),
            femalePresenter: (await this.configurationService.getFemalePresenter()).toUpperCase(),
            channelName: await this.configurationService.getChannelName(),
            censoredWords: await this.configurationService.getCensoredWords()
        }
    }

    async generateNoticieroDraft(): Promise<Noticiero> {
        await this.initConfig();
        const noticias = await this.noticiasService.fetchLatestNews(this.aiConfig.censoredWords);
        const noticiero = this.noticierosRepository.create({
            title: this.aiConfig.channelName + ' - ' + new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
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
        const bienvenida = AiPrompts.bienvenida.join("\n\n")
            .replace(/__CHANNEL_NAME__/g, this.aiConfig.channelName)
            .replace(/__MALE_PRESENTER__/g, this.aiConfig.malePresenter)
            .replace(/__FEMALE_PRESENTER__/g, this.aiConfig.femalePresenter);
        const despedida = AiPrompts.despedida.join("\n\n")
            .replace(/__CHANNEL_NAME__/g, this.aiConfig.channelName)
            .replace(/__MALE_PRESENTER__/g, this.aiConfig.malePresenter)
            .replace(/__FEMALE_PRESENTER__/g, this.aiConfig.femalePresenter);
        const guionContent = await this.callTextGenerationService(this.generatePrompt(noticias), apiKey);
        return [
            bienvenida,
            guionContent,
            despedida
        ].join("\n\n");
    }

    private generatePrompt(noticias: Noticia[]): string {
        const instructions = AiPrompts.guionNoticiero.instruction.join("\n")
            .replace(/__CHANNEL_NAME__/g, this.aiConfig.channelName)
            .replace(/__MALE_PRESENTER__/g, this.aiConfig.malePresenter)
            .replace(/__FEMALE_PRESENTER__/g, this.aiConfig.femalePresenter);
        const prompt = [
            AiPrompts.guionNoticiero.context.join("\n"),
            instructions,
            noticias.map((n: Noticia) => {
                return `
                {
                    "titulo": ${n.title}
                    "contenido": ${n.content}
                    "fuente": ${n.source}
                }
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
