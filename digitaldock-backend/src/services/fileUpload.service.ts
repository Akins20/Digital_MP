/**
 * File Upload Service
 * Handles file uploads to Cloudflare R2
 */

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, r2Config, uploadLimits } from '../config/r2';
import crypto from 'crypto';
import path from 'path';

export interface UploadedFile {
  key: string;
  url: string;
  publicUrl: string;
  size: number;
  mimetype: string;
  originalName: string;
}

export interface UploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

/**
 * Generate unique file key
 */
export const generateFileKey = (folder: string, filename: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${folder}/${timestamp}-${randomString}-${sanitizedFilename}`;
};

/**
 * Validate file type
 */
export const validateFileType = (mimetype: string, isImage: boolean = false): boolean => {
  const allowedTypes = isImage ? uploadLimits.allowedImageTypes : uploadLimits.allowedFileTypes;
  return allowedTypes.includes(mimetype);
};

/**
 * Validate file size
 */
export const validateFileSize = (size: number): boolean => {
  return size <= uploadLimits.maxFileSize;
};

/**
 * Upload file to R2
 */
export const uploadFileToR2 = async (
  file: Express.Multer.File,
  folder: string = 'products',
  isImage: boolean = false
): Promise<UploadResult> => {
  try {
    // Validate file type
    if (!validateFileType(file.mimetype, isImage)) {
      return {
        success: false,
        error: `Invalid file type: ${file.mimetype}`,
      };
    }

    // Validate file size
    if (!validateFileSize(file.size)) {
      return {
        success: false,
        error: `File size exceeds limit of ${uploadLimits.maxFileSize / (1024 * 1024)}MB`,
      };
    }

    // Generate unique key
    const key = generateFileKey(folder, file.originalname);

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });

    await r2Client.send(command);

    // Construct public URL
    const publicUrl = `${r2Config.publicUrl}/${key}`;

    return {
      success: true,
      file: {
        key,
        url: publicUrl,
        publicUrl,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname,
      },
    };
  } catch (error: any) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (
  files: Express.Multer.File[],
  folder: string = 'products',
  isImage: boolean = false
): Promise<{
  success: boolean;
  files: UploadedFile[];
  errors: string[];
}> => {
  const uploadedFiles: UploadedFile[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await uploadFileToR2(file, folder, isImage);
    if (result.success && result.file) {
      uploadedFiles.push(result.file);
    } else {
      errors.push(result.error || 'Unknown error');
    }
  }

  return {
    success: uploadedFiles.length > 0,
    files: uploadedFiles,
    errors,
  };
};

/**
 * Generate signed download URL (expires in 1 hour)
 */
export const generateDownloadUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return signedUrl;
  } catch (error: any) {
    console.error('Generate download URL error:', error);
    throw new Error('Failed to generate download URL');
  }
};

/**
 * Delete file from R2
 */
export const deleteFileFromR2 = async (key: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error: any) {
    console.error('R2 delete error:', error);
    return false;
  }
};

/**
 * Delete multiple files
 */
export const deleteMultipleFiles = async (keys: string[]): Promise<{
  success: boolean;
  deleted: number;
  failed: number;
}> => {
  let deleted = 0;
  let failed = 0;

  for (const key of keys) {
    const result = await deleteFileFromR2(key);
    if (result) {
      deleted++;
    } else {
      failed++;
    }
  }

  return {
    success: deleted > 0,
    deleted,
    failed,
  };
};

/**
 * Check if file exists in R2
 */
export const fileExists = async (key: string): Promise<boolean> => {
  try {
    const command = new HeadObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (key: string): Promise<any> => {
  try {
    const command = new HeadObjectCommand({
      Bucket: r2Config.bucketName,
      Key: key,
    });

    const response = await r2Client.send(command);
    return {
      size: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  } catch (error: any) {
    console.error('Get file metadata error:', error);
    throw new Error('Failed to get file metadata');
  }
};
