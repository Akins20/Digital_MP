/**
 * Upload Routes
 * Handles file upload endpoints
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadProductFiles, uploadImages as uploadImagesMiddleware } from '../middleware/upload';
import {
  uploadFile,
  uploadFiles,
  uploadImage,
  uploadImages,
  deleteFile,
  getDownloadUrl,
  getMetadata,
} from '../controllers/upload.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload and management
 */

/**
 * @swagger
 * /api/upload/file:
 *   post:
 *     summary: Upload a single file (product file)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 description: Folder name (default: products)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or upload failed
 *       401:
 *         description: Unauthorized
 */
router.post('/file', authenticate, uploadProductFiles.single('file'), uploadFile);

/**
 * @swagger
 * /api/upload/files:
 *   post:
 *     summary: Upload multiple files (product files)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 description: Folder name (default: products)
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *       400:
 *         description: Invalid files or upload failed
 *       401:
 *         description: Unauthorized
 */
router.post('/files', authenticate, uploadProductFiles.array('files', 10), uploadFiles);

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload a single image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 description: Folder name (default: images)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid image or upload failed
 *       401:
 *         description: Unauthorized
 */
router.post('/image', authenticate, uploadImagesMiddleware.single('file'), uploadImage);

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               folder:
 *                 type: string
 *                 description: Folder name (default: images)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: Invalid images or upload failed
 *       401:
 *         description: Unauthorized
 */
router.post('/images', authenticate, uploadImagesMiddleware.array('files', 10), uploadImages);

/**
 * @swagger
 * /api/upload/file/{key}:
 *   delete:
 *     summary: Delete a file from storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: File key in R2 storage
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Failed to delete file
 *       401:
 *         description: Unauthorized
 */
router.delete('/file/:key(*)', authenticate, deleteFile);

/**
 * @swagger
 * /api/upload/download-url:
 *   post:
 *     summary: Generate a signed download URL
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *                 description: File key in R2 storage
 *               expiresIn:
 *                 type: number
 *                 description: URL expiration in seconds (default: 3600)
 *     responses:
 *       200:
 *         description: Download URL generated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/download-url', authenticate, getDownloadUrl);

/**
 * @swagger
 * /api/upload/metadata/{key}:
 *   get:
 *     summary: Get file metadata
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: File key in R2 storage
 *     responses:
 *       200:
 *         description: File metadata retrieved successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 */
router.get('/metadata/:key(*)', authenticate, getMetadata);

export default router;
