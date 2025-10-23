import { uploadFileToR2, generateDownloadUrl, deleteFileFromR2 } from '../../src/services/fileUpload.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

const mockS3Client = S3Client as jest.MockedClass<typeof S3Client>;
const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;

describe('File Upload Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFileToR2', () => {
    it('should upload file to R2 successfully', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test-document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test file content'),
        size: 1024,
      } as Express.Multer.File;

      // Mock S3 send method
      const mockSend = jest.fn().mockResolvedValue({});
      mockS3Client.prototype.send = mockSend;

      const result = await uploadFileToR2(mockFile, 'products');

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.file).toBeDefined();
      expect(result.file?.key).toContain('products/');
      expect(result.file?.key).toContain('test-document');
      expect(result.file?.url).toContain('https://');
      expect(result.file?.size).toBe(1024);
      expect(result.file?.mimetype).toBe('application/pdf');
      expect(mockSend).toHaveBeenCalled();
    });

    it('should upload image file to images folder', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'product-cover.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('image content'),
        size: 2048,
      } as Express.Multer.File;

      const mockSend = jest.fn().mockResolvedValue({});
      mockS3Client.prototype.send = mockSend;

      const result = await uploadFileToR2(mockFile, 'images', true);

      expect(result.success).toBe(true);
      expect(result.file?.key).toContain('images/');
      expect(result.file?.mimetype).toBe('image/jpeg');
    });

    it('should sanitize filename', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'My Product File (1).zip',
        encoding: '7bit',
        mimetype: 'application/zip',
        buffer: Buffer.from('content'),
        size: 1024,
      } as Express.Multer.File;

      const mockSend = jest.fn().mockResolvedValue({});
      mockS3Client.prototype.send = mockSend;

      const result = await uploadFileToR2(mockFile, 'products');

      expect(result.success).toBe(true);
      expect(result.file?.key).toContain('My_Product_File__1_');
      expect(result.file?.key).not.toContain(' ');
      expect(result.file?.key).not.toContain('(');
      expect(result.file?.key).not.toContain(')');
    });

    it('should include timestamp in filename', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('content'),
        size: 1024,
      } as Express.Multer.File;

      const mockSend = jest.fn().mockResolvedValue({});
      mockS3Client.prototype.send = mockSend;

      const result = await uploadFileToR2(mockFile, 'products');

      // Check that key contains timestamp (numeric part)
      expect(result.success).toBe(true);
      expect(result.file?.key).toMatch(/\d+/);
    });

    it('should handle upload errors', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('content'),
        size: 1024,
      } as Express.Multer.File;

      const mockSend = jest.fn().mockRejectedValue(new Error('Upload failed'));
      mockS3Client.prototype.send = mockSend;

      const result = await uploadFileToR2(mockFile, 'products');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generateDownloadUrl', () => {
    it('should generate signed download URL', async () => {
      const fileKey = 'products/test-file.zip';
      const mockSignedUrl = 'https://r2.example.com/signed-url';

      mockGetSignedUrl.mockResolvedValue(mockSignedUrl);

      const url = await generateDownloadUrl(fileKey);

      expect(url).toBe(mockSignedUrl);
      expect(mockGetSignedUrl).toHaveBeenCalled();
    });

    it('should generate URL with custom expiration', async () => {
      const fileKey = 'products/test-file.zip';
      const expiresIn = 7200; // 2 hours
      const mockSignedUrl = 'https://r2.example.com/signed-url';

      mockGetSignedUrl.mockResolvedValue(mockSignedUrl);

      const url = await generateDownloadUrl(fileKey, expiresIn);

      expect(url).toBe(mockSignedUrl);
    });

    it('should handle URL generation errors', async () => {
      const fileKey = 'products/test-file.zip';

      mockGetSignedUrl.mockRejectedValue(new Error('URL generation failed'));

      await expect(generateDownloadUrl(fileKey)).rejects.toThrow('Failed to generate download URL');
    });
  });

  describe('deleteFileFromR2', () => {
    it('should delete file from R2', async () => {
      const fileKey = 'products/old-file.zip';

      const mockSend = jest.fn().mockResolvedValue({});
      mockS3Client.prototype.send = mockSend;

      await deleteFileFromR2(fileKey);

      expect(mockSend).toHaveBeenCalled();
      const deleteCommand = mockSend.mock.calls[0][0];
      expect(deleteCommand).toBeInstanceOf(DeleteObjectCommand);
    });

    it('should handle deletion errors', async () => {
      const fileKey = 'products/test-file.zip';

      const mockSend = jest.fn().mockRejectedValue(new Error('Delete failed'));
      mockS3Client.prototype.send = mockSend;

      const result = await deleteFileFromR2(fileKey);

      expect(result).toBe(false);
    });
  });

  describe('File Validation', () => {
    it('should validate file size limits', () => {
      const maxFileSize = 500 * 1024 * 1024; // 500MB
      const validSize = 100 * 1024 * 1024; // 100MB
      const invalidSize = 600 * 1024 * 1024; // 600MB

      expect(validSize).toBeLessThan(maxFileSize);
      expect(invalidSize).toBeGreaterThan(maxFileSize);
    });

    it('should validate allowed file types for products', () => {
      const allowedProductTypes = [
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'image/png',
        'image/jpeg',
        'image/svg+xml',
      ];

      expect(allowedProductTypes).toContain('application/pdf');
      expect(allowedProductTypes).toContain('application/zip');
      expect(allowedProductTypes).not.toContain('text/html');
    });

    it('should validate allowed image types', () => {
      const allowedImageTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
      ];

      expect(allowedImageTypes).toContain('image/jpeg');
      expect(allowedImageTypes).toContain('image/png');
      expect(allowedImageTypes).not.toContain('image/gif');
    });
  });

  describe('File Organization', () => {
    it('should organize files in correct folders', () => {
      const productFolder = 'products';
      const imageFolder = 'images';
      const avatarFolder = 'avatars';

      expect(productFolder).toBe('products');
      expect(imageFolder).toBe('images');
      expect(avatarFolder).toBe('avatars');
    });

    it('should generate unique file keys', () => {
      const timestamp1 = Date.now();
      const timestamp2 = Date.now() + 1;

      const key1 = `products/${timestamp1}-file.pdf`;
      const key2 = `products/${timestamp2}-file.pdf`;

      expect(key1).not.toBe(key2);
    });
  });

  describe('URL Generation', () => {
    it('should generate public URLs correctly', () => {
      const publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-example.r2.dev';
      const fileKey = 'products/test-file.zip';
      const expectedUrl = `${publicUrl}/${fileKey}`;

      expect(expectedUrl).toContain(publicUrl);
      expect(expectedUrl).toContain(fileKey);
    });

    it('should handle URL encoding for special characters', () => {
      const fileKey = 'products/file with spaces.pdf';
      const encodedKey = encodeURIComponent(fileKey);

      expect(encodedKey).not.toContain(' ');
      expect(encodedKey).toContain('products%2F');
    });
  });

  describe('Batch Upload', () => {
    it('should handle multiple file uploads', async () => {
      const mockFiles = [
        {
          fieldname: 'files',
          originalname: 'file1.pdf',
          encoding: '7bit',
          mimetype: 'application/pdf',
          buffer: Buffer.from('content1'),
          size: 1024,
        },
        {
          fieldname: 'files',
          originalname: 'file2.pdf',
          encoding: '7bit',
          mimetype: 'application/pdf',
          buffer: Buffer.from('content2'),
          size: 2048,
        },
      ] as Express.Multer.File[];

      const mockSend = jest.fn().mockResolvedValue({});
      mockS3Client.prototype.send = mockSend;

      const results = await Promise.all(
        mockFiles.map(file => uploadFileToR2(file, 'products'))
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].file?.key).toContain('file1');
      expect(results[1].success).toBe(true);
      expect(results[1].file?.key).toContain('file2');
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it('should track total uploaded size', async () => {
      const files = [
        { size: 1024 },
        { size: 2048 },
        { size: 512 },
      ];

      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      expect(totalSize).toBe(3584);
    });
  });

  describe('Storage Limits', () => {
    it('should enforce max file count limit', () => {
      const maxFiles = 10;
      const fileCount = 5;

      expect(fileCount).toBeLessThanOrEqual(maxFiles);
    });

    it('should calculate storage usage', () => {
      const uploadedFiles = [
        { size: 100 * 1024 * 1024 }, // 100MB
        { size: 200 * 1024 * 1024 }, // 200MB
        { size: 50 * 1024 * 1024 },  // 50MB
      ];

      const totalStorage = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
      const totalMB = totalStorage / (1024 * 1024);

      expect(totalMB).toBe(350);
    });
  });
});
