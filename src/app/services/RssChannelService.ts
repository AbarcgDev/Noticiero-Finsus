import { IRssChannelRepository } from '../persist/repository/IRssChannelRepository.js';
import { rssChannelRepository } from '../persist/rssMySqlRepo.js';
import RssChannel, { RSSChannelFields } from '../models/RssChannel.js';

export class RssChannelService {
    private rssChannelRepository: IRssChannelRepository;

    constructor() {
        this.rssChannelRepository = rssChannelRepository;
    }

    async getAllChannels(): Promise<RssChannel[]> {
        return await this.rssChannelRepository.findAll();
    }

    async getActiveChannels(): Promise<RssChannel[]> {
        return await this.rssChannelRepository.findActiveChannels();
    }

    async getChannelById(id: string): Promise<RssChannel | null> {
        if (!id) {
            throw new Error('Channel ID is required');
        }
        return await this.rssChannelRepository.findById(id);
    }

    async getChannelByUrl(url: string): Promise<RssChannel | null> {
        if (!url) {
            throw new Error('Channel URL is required');
        }
        return await this.rssChannelRepository.findByUrl(url);
    }

    async createChannel(channelData: Omit<RSSChannelFields, 'id'>): Promise<RssChannel> {
        // Validaciones de negocio
        if (!channelData.name?.trim()) {
            throw new Error('Channel name is required');
        }

        if (!channelData.url?.trim()) {
            throw new Error('Channel URL is required');
        }

        if (!this.isValidUrl(channelData.url)) {
            throw new Error('Invalid URL format');
        }

        // Verificar que no exista un canal con la misma URL
        const existingChannel = await this.rssChannelRepository.findByUrl(channelData.url);
        if (existingChannel) {
            throw new Error('A channel with this URL already exists');
        }

        return await this.rssChannelRepository.create(channelData);
    }

    async updateChannel(id: string, updateData: Partial<RSSChannelFields>): Promise<RssChannel | null> {
        if (!id) {
            throw new Error('Channel ID is required');
        }

        // Validaciones de negocio
        if (updateData.name !== undefined && !updateData.name?.trim()) {
            throw new Error('Channel name cannot be empty');
        }

        if (updateData.url !== undefined) {
            if (!updateData.url?.trim()) {
                throw new Error('Channel URL cannot be empty');
            }
            
            if (!this.isValidUrl(updateData.url)) {
                throw new Error('Invalid URL format');
            }

            // Verificar que no exista otro canal con la misma URL
            const existingChannel = await this.rssChannelRepository.findByUrl(updateData.url);
            if (existingChannel && existingChannel.id !== id) {
                throw new Error('A channel with this URL already exists');
            }
        }

        return await this.rssChannelRepository.update(id, updateData);
    }

    async deleteChannel(id: string): Promise<boolean> {
        if (!id) {
            throw new Error('Channel ID is required');
        }

        // Verificar que el canal existe antes de eliminarlo
        const existingChannel = await this.rssChannelRepository.findById(id);
        if (!existingChannel) {
            return false;
        }

        return await this.rssChannelRepository.delete(id);
    }

    async activateChannel(id: string): Promise<boolean> {
        if (!id) {
            throw new Error('Channel ID is required');
        }

        // Verificar que el canal existe
        const existingChannel = await this.rssChannelRepository.findById(id);
        if (!existingChannel) {
            return false;
        }

        return await this.rssChannelRepository.activate(id);
    }

    async deactivateChannel(id: string): Promise<boolean> {
        if (!id) {
            throw new Error('Channel ID is required');
        }

        // Verificar que el canal existe
        const existingChannel = await this.rssChannelRepository.findById(id);
        if (!existingChannel) {
            return false;
        }

        return await this.rssChannelRepository.deactivate(id);
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}
