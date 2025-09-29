import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

export interface R2Config {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    region?: string;
}

export class R2StorageService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(config: R2Config) {
        // Cloudflare R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
        const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;

        this.s3Client = new S3Client({
            region: config.region || 'auto',
            endpoint: endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            forcePathStyle: false, // R2 supports virtual-hosted-style requests
        });

        this.bucketName = config.bucketName;
    }

    async uploadFile(key: string, fileBuffer: Buffer, contentType?: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType || 'application/octet-stream',
            });

            await this.s3Client.send(command);
            return `https://${this.bucketName}.r2.dev/${key}`;
        } catch (error) {
            console.error('Error uploading file to R2:', error);
            throw new Error(`Failed to upload file: ${key}`);
        }
    }

    async uploadStream(key: string, stream: Readable, contentType?: string): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: stream,
                ContentType: contentType || 'application/octet-stream',
            });

            await this.s3Client.send(command);
            return `https://${this.bucketName}.r2.dev/${key}`;
        } catch (error) {
            console.error('Error uploading stream to R2:', error);
            throw new Error(`Failed to upload stream: ${key}`);
        }
    }

    async downloadFile(key: string): Promise<Buffer> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const response = await this.s3Client.send(command);

            if (!response.Body) {
                throw new Error('No body in response');
            }

            const chunks: Uint8Array[] = [];
            const stream = response.Body as Readable;

            return new Promise((resolve, reject) => {
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        } catch (error) {
            console.error('Error downloading file from R2:', error);
            throw new Error(`Failed to download file: ${key}`);
        }
    }

    async getFileStream(key: string): Promise<Readable> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const response = await this.s3Client.send(command);

            if (!response.Body) {
                throw new Error('No body in response');
            }

            return response.Body as Readable;
        } catch (error) {
            console.error('Error getting file stream from R2:', error);
            throw new Error(`Failed to get file stream: ${key}`);
        }
    }

    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
        } catch (error) {
            console.error('Error deleting file from R2:', error);
            throw new Error(`Failed to delete file: ${key}`);
        }
    }

    async listFiles(prefix?: string, maxKeys?: number): Promise<string[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys || 1000,
            });

            const response = await this.s3Client.send(command);
            return response.Contents?.map(obj => obj.Key!) || [];
        } catch (error) {
            console.error('Error listing files from R2:', error);
            throw new Error('Failed to list files');
        }
    }

    async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            console.error('Error generating signed URL for R2:', error);
            throw new Error(`Failed to generate signed URL for: ${key}`);
        }
    }

    async getUploadSignedUrl(key: string, contentType?: string, expiresIn: number = 3600): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
            });

            return await getSignedUrl(this.s3Client, command, { expiresIn });
        } catch (error) {
            console.error('Error generating upload signed URL for R2:', error);
            throw new Error(`Failed to generate upload signed URL for: ${key}`);
        }
    }

    async fileExists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.s3Client.send(command);
            return true;
        } catch (error) {
            return false;
        }
    }

    async getFileMetadata(key: string): Promise<{
        size?: number;
        lastModified?: Date;
        contentType?: string;
        etag?: string;
    }> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const response = await this.s3Client.send(command);

            return {
                size: response.ContentLength,
                lastModified: response.LastModified,
                contentType: response.ContentType,
                etag: response.ETag,
            };
        } catch (error) {
            console.error('Error getting file metadata from R2:', error);
            throw new Error(`Failed to get metadata for: ${key}`);
        }
    }

    // Utility method to generate a public URL (if bucket has public access)
    getPublicUrl(key: string): string {
        return `https://${this.bucketName}.r2.dev/${key}`;
    }

    // Utility method to generate a custom domain URL (if configured)
    getCustomDomainUrl(key: string, customDomain: string): string {
        return `https://${customDomain}/${key}`;
    }
}

// Factory function to create R2 storage service with environment variables
export function createR2StorageService(): R2StorageService {
    const config: R2Config = {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        bucketName: process.env.R2_BUCKET_NAME || 'noticieros',
        region: process.env.R2_REGION || 'auto',
    };

    if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
        throw new Error('R2 configuration is incomplete. Please check your environment variables.');
    }

    return new R2StorageService(config);
}
