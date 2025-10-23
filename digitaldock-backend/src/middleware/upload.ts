/**
 * File Upload Middleware
 * Handles multipart/form-data file uploads using multer
 */

import multer from 'multer';
import { uploadLimits } from '../config/r2';
import { Request } from 'express';

// Use memory storage (files will be in buffer)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed
  if (uploadLimits.allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Please upload a supported file format.`));
  }
};

// Image filter function (stricter)
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (uploadLimits.allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid image type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP are allowed.`));
  }
};

// Multer upload middleware for product files
export const uploadProductFiles = multer({
  storage,
  limits: {
    fileSize: uploadLimits.maxFileSize,
    files: uploadLimits.maxFiles,
  },
  fileFilter,
});

// Multer upload middleware for images only
export const uploadImages = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
    files: 10,
  },
  fileFilter: imageFilter,
});

// Multer upload middleware for single avatar image
export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for avatars
    files: 1,
  },
  fileFilter: imageFilter,
});

// Error handler for multer errors
export const handleMulterError = (error: any): string => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return 'File too large. Maximum size is 500MB for products, 10MB for images.';
      case 'LIMIT_FILE_COUNT':
        return `Too many files. Maximum is ${uploadLimits.maxFiles} files.`;
      case 'LIMIT_UNEXPECTED_FILE':
        return 'Unexpected field in form data.';
      default:
        return error.message;
    }
  }
  return error.message || 'File upload error';
};
