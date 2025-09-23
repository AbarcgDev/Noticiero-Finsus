import { Request, Response } from 'express';
import { RssChannelService } from '../services/RssChannelService.js';
import { RSSChannelFields } from '../models/RssChannel.js';

export class RssChannelController {
    private rssChannelService: RssChannelService;

    constructor() {
        this.rssChannelService = new RssChannelService();
    }

    async getAllChannels(req: Request, res: Response): Promise<void> {
        try {
            const channels = await this.rssChannelService.getAllChannels();
            res.status(200).json({
                success: true,
                data: channels
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving RSS channels',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getChannelById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const channel = await this.rssChannelService.getChannelById(id);

            if (!channel) {
                res.status(404).json({
                    success: false,
                    message: 'RSS channel not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: channel
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving RSS channel',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async createChannel(req: Request, res: Response): Promise<void> {
        try {
            const channelData: Omit<RSSChannelFields, 'id'> = req.body;

            // Validación básica
            if (!channelData.name || !channelData.url) {
                res.status(400).json({
                    success: false,
                    message: 'Name and URL are required'
                });
                return;
            }

            const newChannel = await this.rssChannelService.createChannel(channelData);
            res.status(201).json({
                success: true,
                data: newChannel
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating RSS channel',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateChannel(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData: Partial<RSSChannelFields> = req.body;

            const updatedChannel = await this.rssChannelService.updateChannel(id, updateData);

            if (!updatedChannel) {
                res.status(404).json({
                    success: false,
                    message: 'RSS channel not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: updatedChannel
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating RSS channel',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deleteChannel(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await this.rssChannelService.deleteChannel(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'RSS channel not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'RSS channel deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting RSS channel',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async activateChannel(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const activated = await this.rssChannelService.activateChannel(id);

            if (!activated) {
                res.status(404).json({
                    success: false,
                    message: 'RSS channel not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'RSS channel activated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error activating RSS channel',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deactivateChannel(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const deactivated = await this.rssChannelService.deactivateChannel(id);

            if (!deactivated) {
                res.status(404).json({
                    success: false,
                    message: 'RSS channel not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'RSS channel deactivated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deactivating RSS channel',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
