import { Request, Response } from "express";
import { NoticieroService } from "../services/noticierosService";
import HttpStatus from "http-status-codes";
import { AudioGenerationService } from "../services/audioGenerationService";
import { createR2StorageService } from "../services/r2StorageService";
import { Readable } from 'stream';

export class NoticieroController {
    private noticieroService: NoticieroService;
    private audioGenerationService: AudioGenerationService;

    constructor() {
        this.noticieroService = new NoticieroService();
        this.audioGenerationService = new AudioGenerationService();
    }

    async createNoticieroDraft(req: Request, res: Response): Promise<void> {
        try {
            const noticiero = await this.noticieroService.generateNoticieroDraft();
            res.status(HttpStatus.CREATED).json({
                success: true,
                data: noticiero
            });
        } catch (error) {
            console.error("Error creating noticiero draft:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error creating noticiero draft',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllNoticieros(req: Request, res: Response): Promise<void> {
        try {
            const noticieros = await this.noticieroService.getAllNoticieros()
            if (!noticieros) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Noticieros not found'
                })
                return;
            }
            res.status(HttpStatus.OK).json({
                success: true,
                data: noticieros
            })
        } catch (error) {
            console.error("Error getting all noticieros:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error getting all noticieros',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }

    async getNoticieroById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const noticiero = await this.noticieroService.getNoticieroById(id);
            if (!noticiero) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Noticiero not found'
                })
                return;
            }
            res.status(HttpStatus.OK).json({
                success: true,
                data: noticiero
            })
        } catch (error) {
            console.error("Error getting noticiero by id:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error getting noticiero by id',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }

    async updateNoticiero(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const noticieroData = req.body;
            if (!id || !noticieroData) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Noticiero id and data are required'
                })
                return;
            }
            const updatedNoticiero = await this.noticieroService.updateNoticiero(id, noticieroData);
            if (!updatedNoticiero) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Noticiero not found'
                })
                return;
            }
            res.status(HttpStatus.OK).json({
                success: true,
                data: updatedNoticiero
            })
        } catch (error) {
            console.error("Error updating noticiero:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error updating noticiero',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }

    async deleteNoticiero(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await this.noticieroService.deleteNoticiero(id);
            if (!deleted) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Noticiero not found'
                })
                return;
            }
            res.status(HttpStatus.OK).json({
                success: true,
                message: 'Noticiero deleted successfully'
            })
        } catch (error) {
            console.error("Error deleting noticiero:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error deleting noticiero',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }

    async publishNoticiero(req: Request, res: Response): Promise<void> {
        const noticiero = await this.noticieroService.getNoticieroById(req.params.id);
        await this.noticieroService.publishNoticiero(req.params.id);
        this.audioGenerationService.generateAudio(req.params.id, noticiero?.guion ?? '');
        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Audio will be available at /api/noticieros/latest' + req.params.id + '/audio'
        })
    }

    async rejectNoticiero(req: Request, res: Response): Promise<void> {
        await this.noticieroService.rejectNoticiero(req.params.id);
        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Noticiero rejected successfully'
        });
    }

    /**
     * Get audio stream for the latest noticiero
     */
    async getLatestNoticieroAudio(req: Request, res: Response): Promise<void> {
        try {
            const latestNoticiero = await this.noticieroService.getLatestPublishedNoticiero();
            if (!latestNoticiero) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'No published noticieros found'
                });
                return;
            }

            await this.streamNoticieroAudio(latestNoticiero.id, res);
        } catch (error) {
            console.error('Error getting latest noticiero audio:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error retrieving audio',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get audio stream for a specific noticiero
     */
    async getNoticieroAudioById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            await this.streamNoticieroAudio(id, res);
        } catch (error) {
            console.error(`Error getting audio for noticiero ${req.params.id}:`, error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error retrieving audio',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Helper method to stream audio from storage
     */
    private async streamNoticieroAudio(noticieroId: string, res: Response): Promise<void> {
        try {
            const storage = createR2StorageService();
            const audioKey = `audio/noticieros/${noticieroId}.mp3`;

            // Check if file exists
            const exists = await storage.fileExists(audioKey);
            if (!exists) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Audio file not found for this noticiero'
                });
                return;
            }

            // Get file stream and metadata
            const stream = await storage.getFileStream(audioKey);
            const metadata = await storage.getFileMetadata(audioKey);

            // Set appropriate headers for audio streaming
            res.set({
                'Content-Type': metadata.contentType || 'audio/mpeg',
                'Content-Length': metadata.size,
                'Content-Disposition': `inline; filename="noticiero-${noticieroId}.mp3"`,
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
                'Accept-Ranges': 'bytes'
            });

            // Pipe the audio stream to the response
            stream.pipe(res);

            // Handle stream errors
            stream.on('error', (error) => {
                console.error('Error streaming audio:', error);
                if (!res.headersSent) {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: 'Error streaming audio'
                    });
                }
            });

        } catch (error) {
            console.error('Error in streamNoticieroAudio:', error);
            if (!res.headersSent) {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Internal server error while processing audio stream'
                });
            }
            throw error; // Re-throw to be caught by the calling method
        }
    }
}
