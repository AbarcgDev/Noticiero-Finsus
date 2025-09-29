import { Request, Response } from 'express';
import { NoticiasService } from '../services/noticiasService.js';
import { ConfigurationService } from '@/services/configurationService.js';

export class NoticiasController {
    private noticiasService: NoticiasService;
    private configurationService: ConfigurationService;

    constructor() {
        this.noticiasService = new NoticiasService();
        this.configurationService = new ConfigurationService();
    }

    async getNoticias(req: Request, res: Response): Promise<void> {
        try {
            const censoredWords = await this.configurationService.getCensoredWords();
            const noticias = await this.noticiasService.fetchLatestNews(censoredWords);
            res.status(200).json({
                success: true,
                data: noticias,
                count: noticias.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching news',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getNoticiasBySource(req: Request, res: Response): Promise<void> {
        try {
            const { source } = req.params;
            const censoredWords = await this.configurationService.getCensoredWords();
            const noticias = await this.noticiasService.fetchNewsBySource(source, censoredWords);

            res.status(200).json({
                success: true,
                data: noticias,
                count: noticias.length,
                source
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching news by source',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
