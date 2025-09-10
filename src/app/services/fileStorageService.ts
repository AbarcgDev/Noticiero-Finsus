import { createR2StorageService, R2StorageService } from './r2StorageService';

export class FileStorageService {
    private r2Storage: R2StorageService;

    constructor() {
        this.r2Storage = createR2StorageService();
    }

    // Upload generated news script audio files
    async uploadAudioFile(noticieroId: string, audioBuffer: Buffer): Promise<string> {
        const key = `audio/noticieros/${noticieroId}.mp3`;
        return await this.r2Storage.uploadFile(key, audioBuffer, 'audio/mpeg');
    }

    // Upload news images or thumbnails
    async uploadImage(fileName: string, imageBuffer: Buffer, contentType: string): Promise<string> {
        const key = `images/${Date.now()}-${fileName}`;
        return await this.r2Storage.uploadFile(key, imageBuffer, contentType);
    }

    // Upload generated news scripts as text files
    async uploadScript(noticieroId: string, scriptContent: string): Promise<string> {
        const key = `scripts/${noticieroId}.txt`;
        const buffer = Buffer.from(scriptContent, 'utf-8');
        return await this.r2Storage.uploadFile(key, buffer, 'text/plain');
    }

    // Get signed URL for private file access
    async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
        return await this.r2Storage.getSignedUrl(key, expiresIn);
    }

    // Get public URL for public files
    getPublicUrl(key: string): string {
        return this.r2Storage.getPublicUrl(key);
    }

    // Delete old files
    async deleteFile(key: string): Promise<void> {
        return await this.r2Storage.deleteFile(key);
    }

    // List files by prefix
    async listFiles(prefix: string): Promise<string[]> {
        return await this.r2Storage.listFiles(prefix);
    }

    // Check if file exists
    async fileExists(key: string): Promise<boolean> {
        return await this.r2Storage.fileExists(key);
    }

    // Get file metadata
    async getFileInfo(key: string) {
        return await this.r2Storage.getFileMetadata(key);
    }

    // Generate upload URL for direct client uploads
    async generateUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
        return await this.r2Storage.getUploadSignedUrl(key, contentType, expiresIn);
    }
}
