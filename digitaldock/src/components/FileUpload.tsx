'use client';

/**
 * File Upload Component
 * Reusable component with drag-and-drop support
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
  helperText?: string;
}

export default function FileUpload({
  accept,
  multiple = false,
  maxSizeMB = 100,
  maxFiles = 1,
  onFilesSelected,
  disabled = false,
  label = 'Upload Files',
  helperText,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // Check number of files
    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
      return { valid, errors };
    }

    for (const file of files) {
      // Check file size
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name} is too large (max ${maxSizeMB}MB)`);
        continue;
      }

      // Check file type if accept is specified
      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const fileExtension = `.${file.name.split('.').pop()}`;
        const fileMimeType = file.type;

        const isAccepted = acceptedTypes.some(
          (type) =>
            type === fileMimeType ||
            type === fileExtension ||
            (type.endsWith('/*') && fileMimeType.startsWith(type.replace('/*', '')))
        );

        if (!isAccepted) {
          errors.push(`${file.name} has invalid file type`);
          continue;
        }
      }

      valid.push(file);
    }

    return { valid, errors };
  };

  const handleFiles = (files: FileList | null) => {
    setError(null);

    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const { valid, errors } = validateFiles(filesArray);

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          {/* Upload Icon */}
          <svg
            className={`w-12 h-12 mb-4 ${
              isDragging ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          {/* Text */}
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>

          {helperText && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
          )}

          {/* File info */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {accept && `Accepted: ${accept}`}
            {maxSizeMB && ` · Max size: ${maxSizeMB}MB`}
            {multiple && maxFiles > 1 && ` · Max ${maxFiles} files`}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
