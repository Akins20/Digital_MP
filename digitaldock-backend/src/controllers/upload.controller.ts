/**
 * Upload Controllers
 * Handles file upload operations
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  uploadFileToR2,
  uploadMultipleFiles,
  deleteFileFromR2,
  generateDownloadUrl,
  getFileMetadata,
} from '../services/fileUpload.service';
import { handleMulterError } from '../middleware/upload';

/**
 * Upload single file
 * POST /api/upload/file
 */
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const { folder = 'products' } = req.body;

    const result = await uploadFileToR2(req.file, folder, false);

    if (result.success) {
      res.status(200).json({
        message: 'File uploaded successfully',
        file: result.file,
      });
    } else {
      res.status(400).json({
        error: result.error || 'File upload failed',
      });
    }
  } catch (error: any) {
    console.error('Upload file error:', error);
    const errorMessage = handleMulterError(error);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Upload multiple files
 * POST /api/upload/files
 */
export const uploadFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No files provided' });
      return;
    }

    const { folder = 'products' } = req.body;

    const result = await uploadMultipleFiles(req.files, folder, false);

    if (result.success) {
      res.status(200).json({
        message: `${result.files.length} file(s) uploaded successfully`,
        files: result.files,
        errors: result.errors.length > 0 ? result.errors : undefined,
      });
    } else {
      res.status(400).json({
        error: 'All files failed to upload',
        errors: result.errors,
      });
    }
  } catch (error: any) {
    console.error('Upload files error:', error);
    const errorMessage = handleMulterError(error);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Upload image
 * POST /api/upload/image
 */
export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const { folder = 'images' } = req.body;

    const result = await uploadFileToR2(req.file, folder, true);

    if (result.success) {
      res.status(200).json({
        message: 'Image uploaded successfully',
        file: result.file,
      });
    } else {
      res.status(400).json({
        error: result.error || 'Image upload failed',
      });
    }
  } catch (error: any) {
    console.error('Upload image error:', error);
    const errorMessage = handleMulterError(error);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Upload multiple images
 * POST /api/upload/images
 */
export const uploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No images provided' });
      return;
    }

    const { folder = 'images' } = req.body;

    const result = await uploadMultipleFiles(req.files, folder, true);

    if (result.success) {
      res.status(200).json({
        message: `${result.files.length} image(s) uploaded successfully`,
        files: result.files,
        errors: result.errors.length > 0 ? result.errors : undefined,
      });
    } else {
      res.status(400).json({
        error: 'All images failed to upload',
        errors: result.errors,
      });
    }
  } catch (error: any) {
    console.error('Upload images error:', error);
    const errorMessage = handleMulterError(error);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * Delete file
 * DELETE /api/upload/file/:key
 */
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { key } = req.params;

    if (!key) {
      res.status(400).json({ error: 'File key is required' });
      return;
    }

    // Decode the key (it might be URL encoded)
    const decodedKey = decodeURIComponent(key);

    const success = await deleteFileFromR2(decodedKey);

    if (success) {
      res.status(200).json({
        message: 'File deleted successfully',
        key: decodedKey,
      });
    } else {
      res.status(400).json({
        error: 'Failed to delete file',
      });
    }
  } catch (error: any) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'An error occurred while deleting file' });
  }
};

/**
 * Generate download URL
 * POST /api/upload/download-url
 */
export const getDownloadUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { key, expiresIn = 3600 } = req.body;

    if (!key) {
      res.status(400).json({ error: 'File key is required' });
      return;
    }

    const downloadUrl = await generateDownloadUrl(key, expiresIn);

    res.status(200).json({
      downloadUrl,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('Generate download URL error:', error);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
};

/**
 * Get file metadata
 * GET /api/upload/metadata/:key
 */
export const getMetadata = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { key } = req.params;

    if (!key) {
      res.status(400).json({ error: 'File key is required' });
      return;
    }

    const decodedKey = decodeURIComponent(key);
    const metadata = await getFileMetadata(decodedKey);

    res.status(200).json({
      key: decodedKey,
      metadata,
    });
  } catch (error: any) {
    console.error('Get file metadata error:', error);
    res.status(404).json({ error: 'File not found or metadata unavailable' });
  }
};
