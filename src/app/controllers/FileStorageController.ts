import { Request, Response } from 'express';
import { FileStorageService } from '../services/fileStorageService';

export class FileStorageController {
    private fileStorageService: FileStorageService;

    constructor() {
        this.fileStorageService = new FileStorageService();
    }

    // Upload file endpoint
    async uploadFile(req: Request, res: Response): Promise<void> {
        try {
            const { fileName, contentType } = req.body;
            const fileBuffer = req.file?.buffer;

            if (!fileBuffer) {
                res.status(400).json({ error: 'No file provided' });
                return;
            }

            const fileUrl = await this.fileStorageService.uploadImage(fileName, fileBuffer, contentType);
            
            res.status(200).json({
                success: true,
                fileUrl,
                message: 'File uploaded successfully'
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }

    // Get signed URL for file access
    async getFileUrl(req: Request, res: Response): Promise<void> {
        try {
            const { key } = req.params;
            const { expiresIn } = req.query;

            const fileUrl = await this.fileStorageService.getFileUrl(
                key, 
                expiresIn ? parseInt(expiresIn as string) : 3600
            );
            
            res.status(200).json({
                success: true,
                fileUrl
            });
        } catch (error) {
            console.error('Error getting file URL:', error);
            res.status(500).json({ error: 'Failed to get file URL' });
        }
    }

    // Generate upload URL for direct client uploads
    async generateUploadUrl(req: Request, res: Response): Promise<void> {
        try {
            const { key, contentType } = req.body;
            const { expiresIn } = req.query;

            const uploadUrl = await this.fileStorageService.generateUploadUrl(
                key,
                contentType,
                expiresIn ? parseInt(expiresIn as string) : 3600
            );
            
            res.status(200).json({
                success: true,
                uploadUrl
            });
        } catch (error) {
            console.error('Error generating upload URL:', error);
            res.status(500).json({ error: 'Failed to generate upload URL' });
        }
    }

    // List files by prefix
    async listFiles(req: Request, res: Response): Promise<void> {
        try {
            const { prefix } = req.query;
            
            const files = await this.fileStorageService.listFiles(prefix as string);
            
            res.status(200).json({
                success: true,
                files
            });
        } catch (error) {
            console.error('Error listing files:', error);
            res.status(500).json({ error: 'Failed to list files' });
        }
    }

    // Delete file
    async deleteFile(req: Request, res: Response): Promise<void> {
        try {
            const { key } = req.params;
            
            await this.fileStorageService.deleteFile(key);
            
            res.status(200).json({
                success: true,
                message: 'File deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting file:', error);
            res.status(500).json({ error: 'Failed to delete file' });
        }
    }

    // Get file metadata
    async getFileInfo(req: Request, res: Response): Promise<void> {
        try {
            const { key } = req.params;
            
            const fileInfo = await this.fileStorageService.getFileInfo(key);
            
            res.status(200).json({
                success: true,
                fileInfo
            });
        } catch (error) {
            console.error('Error getting file info:', error);
            res.status(500).json({ error: 'Failed to get file info' });
        }
    }
}
