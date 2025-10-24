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
    'application/rtf',
    'text/rtf',

    // Archives (multiple MIME types for better compatibility)
    'application/zip',
    'application/x-zip-compressed',
    'multipart/x-zip',
    'application/x-compressed',
    'application/x-rar-compressed',
    'application/x-rar',
    'application/vnd.rar',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/x-gtar',
    'application/gzip',
    'application/x-gzip',
    'application/x-bzip',
    'application/x-bzip2',

    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/x-icon',
    'image/vnd.adobe.photoshop',

    // Design & 3D files
    'application/x-figma',
    'application/sketch',
    'application/photoshop',
    'application/illustrator',
    'model/gltf-binary',
    'model/gltf+json',
    'application/octet-stream', // Generic binary (covers many file types)

    // Code & Text
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/x-javascript',
    'text/x-python',
    'text/x-java',
    'text/x-c',
    'text/x-c++',
    'text/x-php',
    'text/x-ruby',
    'text/x-go',
    'text/x-rust',
    'application/json',
    'application/xml',
    'text/xml',
    'text/csv',
    'text/markdown',

    // Fonts
    'font/ttf',
    'font/otf',
    'font/woff',
    'font/woff2',
    'application/font-woff',
    'application/font-woff2',
    'application/x-font-ttf',
    'application/x-font-otf',

    // Video
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/mpeg',

    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',

    // Executables & Installers (for software products)
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/exe',
    'application/x-exe',
    'application/x-winexe',
    'application/x-apple-diskimage',
    'application/vnd.microsoft.portable-executable',

    // Ebooks
    'application/epub+zip',
    'application/x-mobipocket-ebook',

    // Database
    'application/x-sqlite3',
    'application/sql',
  ],
  allowedImageTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};

// Get file extension from mimetype
export const getExtensionFromMimetype = (mimetype: string): string => {
  const mimeToExt: { [key: string]: string } = {
    // Documents
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/rtf': 'rtf',
    'text/rtf': 'rtf',

    // Archives
    'application/zip': 'zip',
    'application/x-zip-compressed': 'zip',
    'multipart/x-zip': 'zip',
    'application/x-compressed': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-rar': 'rar',
    'application/vnd.rar': 'rar',
    'application/x-7z-compressed': '7z',
    'application/x-tar': 'tar',
    'application/x-gtar': 'tar.gz',
    'application/gzip': 'gz',
    'application/x-gzip': 'gz',
    'application/x-bzip': 'bz',
    'application/x-bzip2': 'bz2',

    // Images
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'image/x-icon': 'ico',
    'image/vnd.adobe.photoshop': 'psd',

    // Text & Code
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/javascript': 'js',
    'application/x-javascript': 'js',
    'text/x-python': 'py',
    'text/x-java': 'java',
    'text/x-c': 'c',
    'text/x-c++': 'cpp',
    'text/x-php': 'php',
    'text/x-ruby': 'rb',
    'text/x-go': 'go',
    'text/x-rust': 'rs',
    'application/json': 'json',
    'application/xml': 'xml',
    'text/xml': 'xml',
    'text/csv': 'csv',
    'text/markdown': 'md',

    // Fonts
    'font/ttf': 'ttf',
    'font/otf': 'otf',
    'font/woff': 'woff',
    'font/woff2': 'woff2',
    'application/font-woff': 'woff',
    'application/font-woff2': 'woff2',
    'application/x-font-ttf': 'ttf',
    'application/x-font-otf': 'otf',

    // Video
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'video/mpeg': 'mpeg',

    // Audio
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'weba',

    // Executables
    'application/x-msdownload': 'exe',
    'application/x-msdos-program': 'exe',
    'application/exe': 'exe',
    'application/x-exe': 'exe',
    'application/x-winexe': 'exe',
    'application/x-apple-diskimage': 'dmg',
    'application/vnd.microsoft.portable-executable': 'exe',

    // Ebooks
    'application/epub+zip': 'epub',
    'application/x-mobipocket-ebook': 'mobi',

    // Database
    'application/x-sqlite3': 'db',
    'application/sql': 'sql',

    // 3D
    'model/gltf-binary': 'glb',
    'model/gltf+json': 'gltf',

    // Generic binary
    'application/octet-stream': 'bin',
  };

  return mimeToExt[mimetype] || 'bin';
};

export default r2Client;
