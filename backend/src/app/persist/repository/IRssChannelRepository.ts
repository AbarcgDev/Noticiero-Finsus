import RssChannel, { RSSChannelFields } from "../../models/RssChannel";

export interface IRssChannelRepository {
    findAll(): Promise<RssChannel[]>;
    findById(id: string): Promise<RssChannel | null>;
    findByUrl(rssUrl: string): Promise<RssChannel | null>;
    findActiveChannels(): Promise<RssChannel[]>;
    create(channelData: Omit<RSSChannelFields, 'id'>): Promise<RssChannel>;
    update(id: string, channelData: Partial<RSSChannelFields>): Promise<RssChannel | null>;
    delete(id: string): Promise<boolean>;
    activate(id: string): Promise<boolean>;
    deactivate(id: string): Promise<boolean>;
}