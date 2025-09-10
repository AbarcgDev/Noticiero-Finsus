import { Noticia } from "../models/Noticia.js";
import { XMLParser } from "fast-xml-parser";
import RssChannel, { RSSChannelFields } from "../models/RssChannel.js";
import * as cheerio from "cheerio";
import { filterNews } from "../utils/filterNews.js";
import { RssChannelService } from "./RssChannelService.js";

export class NoticiasService {
    private rssChannelService: RssChannelService;

    constructor() {
        this.rssChannelService = new RssChannelService();
    }

    async fetchLatestNews(): Promise<Noticia[]> {
        const activeChannels = await this.rssChannelService.getActiveChannels();
        return await this.getNoticias(activeChannels);
    }

    async fetchNewsBySource(source: string): Promise<Noticia[]> {
        const channels = await this.rssChannelService.getAllChannels();
        return await this.getNoticias(channels);
    }

    async getNoticias(channels: RssChannel[]): Promise<Noticia[]> {
        try {
            const fetchPromises = channels.map(async (channel: RssChannel) => {
                try {
                    const xmlString = await this.getRssRaw(channel.url);
                    console.log(`Processing channel ${channel.url}`);
                    return this.extractNewsFromRss(xmlString);
                } catch (error) {
                    console.error(`Error processing channel ${channel.url}:`, error);
                    return [];
                }
            });

            const allNews = (await Promise.all(fetchPromises)).flat();
            const filteredNews = filterNews(allNews)
            console.log(`Se descartaron ${allNews.length - filteredNews.length} noticias`)
            console.log(`Se enviarán ${filteredNews.length} noticias`)
            return filteredNews;
        } catch (error) {
            console.error("An unexpected error occurred in getNewsFromRSSSources:", error);
            return [];
        }
    }

    getRssRaw = async (url: string): Promise<string> => {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error obteniendo feed RSS ${response.statusText}`);
        }
        return await response.text();
    }

    extractNewsFromRss = async (xmlString: string): Promise<Noticia[]> => {
        const parser = new XMLParser({
            tagValueProcessor: (tagName, tagValue) => {
                if (typeof tagValue === 'string' && tagValue.startsWith('<![CDATA[')) {
                    return tagValue.slice(9, -3).trim();
                }
                return tagValue;
            }
        });

        const feedContent = parser.parse(xmlString);
        console.log(feedContent);
        const items = feedContent.rss?.channel?.item || [];

        const newsPromises = items.map(async (item: any) => {
            // Try different ways to access content:encoded
            const contentEncoded = item["content:encoded"] || item.contentEncoded || item.content;
            const content = contentEncoded || item.description || "";

            return {
                title: item.title || "",
                categories: item.category || [],
                publicationDate: new Date(item.pubDate),
                content: this.cleanHtmlWithCheerio(content),
                source: feedContent.rss?.channel?.title || ""
            };
        });

        return Promise.all(newsPromises);
    }

    cleanHtmlWithCheerio(htmlContent: string): string {
        if (!htmlContent || typeof htmlContent !== 'string') {
            return '';
        }
        const $ = cheerio.load(htmlContent);
        return $.text().trim();
    }

}
