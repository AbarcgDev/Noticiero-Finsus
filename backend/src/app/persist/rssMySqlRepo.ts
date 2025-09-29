import RssChannel, { RSSChannelFields } from '../models/RssChannel';
import { IRssChannelRepository } from './repository/IRssChannelRepository';
import { Op } from 'sequelize';

// MySQL implementation
export class RssChannelMySqlRepository implements IRssChannelRepository {

    async findAll(): Promise<RssChannel[]> {
        try {
            const channels = await RssChannel.findAll({
                order: [['name', 'ASC']]
            });
            return channels;
        } catch (error) {
            console.error('Error finding all RSS channels:', error);
            throw new Error('Failed to retrieve RSS channels');
        }
    }

    async findById(id: string): Promise<RssChannel | null> {
        try {
            const channel = await RssChannel.findByPk(id);
            return channel;
        } catch (error) {
            console.error(`Error finding RSS channel by ID ${id}:`, error);
            throw new Error('Failed to retrieve RSS channel');
        }
    }

    async findByUrl(rssUrl: string): Promise<RssChannel | null> {
        try {
            const channel = await RssChannel.findOne({
                where: { url: rssUrl }
            });
            return channel;
        } catch (error) {
            console.error(`Error finding RSS channel by URL ${rssUrl}:`, error);
            throw new Error('Failed to retrieve RSS channel by URL');
        }
    }

    async findActiveChannels(): Promise<RssChannel[]> {
        try {
            const channels = await RssChannel.findAll({
                where: { isActive: true },
                order: [['name', 'ASC']]
            });
            return channels;
        } catch (error) {
            console.error('Error finding active RSS channels:', error);
            throw new Error('Failed to retrieve active RSS channels');
        }
    }

    async create(channelData: Omit<RSSChannelFields, 'id'>): Promise<RssChannel> {
        try {
            const channel = await RssChannel.create({
                name: channelData.name,
                url: channelData.url,
                isActive: channelData.isActive ?? true
            });
            return channel;
        } catch (error) {
            console.error('Error creating RSS channel:', error);
            throw new Error('Failed to create RSS channel');
        }
    }

    async update(id: string, channelData: Partial<RSSChannelFields>): Promise<RssChannel | null> {
        try {
            const updateData: any = {};
            if (channelData.name) updateData.name = channelData.name;
            if (channelData.url) updateData.url = channelData.url;
            if (channelData.isActive !== undefined) updateData.isActive = channelData.isActive;

            const [updatedRowsCount] = await RssChannel.update(updateData, {
                where: { id }
            });

            if (updatedRowsCount === 0) {
                return null;
            }

            return await this.findById(id);
        } catch (error) {
            console.error(`Error updating RSS channel ${id}:`, error);
            throw new Error('Failed to update RSS channel');
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const deletedRowsCount = await RssChannel.destroy({
                where: { id }
            });
            return deletedRowsCount > 0;
        } catch (error) {
            console.error(`Error deleting RSS channel ${id}:`, error);
            throw new Error('Failed to delete RSS channel');
        }
    }

    async activate(id: string): Promise<boolean> {
        try {
            const [updatedRowsCount] = await RssChannel.update(
                { isActive: true },
                { where: { id } }
            );
            return updatedRowsCount > 0;
        } catch (error) {
            console.error(`Error activating RSS channel ${id}:`, error);
            return false;
        }
    }

    async deactivate(id: string): Promise<boolean> {
        try {
            const [updatedRowsCount] = await RssChannel.update(
                { isActive: false },
                { where: { id } }
            );
            return updatedRowsCount > 0;
        } catch (error) {
            console.error(`Error deactivating RSS channel ${id}:`, error);
            return false;
        }
    }

}

// Export singleton instance
export const rssChannelRepository = new RssChannelMySqlRepository();