import { Request, Response } from 'express';
import { NoticiasService } from '../services/noticiasService.js';

export class NoticiasController {
    private noticiasService: NoticiasService;

    constructor() {
        this.noticiasService = new NoticiasService();
    }

    async getNoticias(req: Request, res: Response): Promise<void> {
        try {
            const noticias = await this.noticiasService.fetchLatestNews();
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
            const noticias = await this.noticiasService.fetchNewsBySource(source);

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
