/**
 * Cloudflare R2 Storage Configuration
 * S3-compatible object storage
 */

import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Cloudflare R2 configuration
export const r2Config = {
  accountId: process.env.R2_ACCOUNT_ID || '',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.R2_BUCKET_NAME || 'digitaldock-storage',
  publicUrl: process.env.R2_PUBLIC_URL || '',
  endpoint: process.env.R2_ENDPOINT || '',
};

// Validate R2 configuration
export const validateR2Config = (): boolean => {
  const required = ['accountId', 'accessKeyId', 'secretAccessKey', 'bucketName', 'endpoint'];
  const missing = required.filter(key => !r2Config[key as keyof typeof r2Config]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing R2 configuration: ${missing.join(', ')}`);
    return false;
  }

  return true;
};

// Create S3 client for R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Config.endpoint,
  credentials: {
    accessKeyId: r2Config.accessKeyId,
    secretAccessKey: r2Config.secretAccessKey,
  },
});

// File upload limits
export const uploadLimits = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  maxFiles: 10,
  allowedFileTypes: [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',

    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',

    // Design files
    'application/x-figma',
    'application/sketch',
    'application/photoshop',

    // Code
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',

    // Fonts
    'font/ttf',
    'font/otf',
    'font/woff',
    'font/woff2',

    // Video (for previews)
    'video/mp4',
    'video/webm',

    // Audio
    'audio/mpeg',
    'audio/wav',
  ],
  allowedImageTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};

// Get file extension from mimetype
export const getExtensionFromMimetype = (mimetype: string): string => {
  const mimeToExt: { [key: string]: string } = {
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'text/plain': 'txt',
    'application/json': 'json',
    // Add more as needed
  };

  return mimeToExt[mimetype] || 'bin';
};

export default r2Client;
