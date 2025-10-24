/**
 * Upload API Module
 * Handles file upload requests to R2 storage
 */

// Note: File uploads use FormData, not the unified API client
// since they need special handling for multipart/form-data

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
  key: string;
}

export interface UploadResponse {
  success: boolean;
  file?: UploadedFile;
  files?: UploadedFile[];
  error?: string;
  message?: string;
}

/**
 * Upload a single file (product file)
 */
export async function uploadFile(
  token: string,
  file: File,
  folder?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(`${API_URL}/api/upload/file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
}

/**
 * Upload multiple files (product files)
 */
export async function uploadFiles(
  token: string,
  files: File[],
  folder?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(`${API_URL}/api/upload/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
}

/**
 * Upload a single image (with optimization)
 */
export async function uploadImage(
  token: string,
  file: File,
  folder?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(`${API_URL}/api/upload/image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
}

/**
 * Upload multiple images
 */
export async function uploadImages(
  token: string,
  files: File[],
  folder?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(`${API_URL}/api/upload/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed');
  }

  return data;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  token: string,
  key: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/upload/file/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Delete failed');
  }

  return data;
}

/**
 * Generate a signed download URL
 */
export async function generateDownloadUrl(
  token: string,
  key: string,
  expiresIn?: number
): Promise<{ url: string; expiresIn: number }> {
  const response = await fetch(`${API_URL}/api/upload/download-url`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, expiresIn }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate download URL');
  }

  return data;
}
