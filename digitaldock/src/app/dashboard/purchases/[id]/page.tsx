'use client';

/**
 * Purchase Download Page
 * View and download files for a specific purchase
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import * as purchasesApi from '@/lib/api/purchases';

export default function PurchaseDownloadPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { success, error: showError } = useNotification();
  const [downloadData, setDownloadData] = useState<purchasesApi.DownloadLinksResponse | null>(
    null
  );
  const [isLoadingDownload, setIsLoadingDownload] = useState(true);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadDownloadLinks();
    }
  }, [isAuthenticated, token, params.id]);

  const loadDownloadLinks = async () => {
    if (!token || !params.id) return;

    try {
      setIsLoadingDownload(true);
      const response = await purchasesApi.getDownloadLinks(token, params.id as string);
      setDownloadData(response);
    } catch (error: any) {
      console.error('Failed to load download links:', error);
      showError(error.message || 'Failed to load download links', 'Error');
      // Redirect back to purchases if there's an error
      setTimeout(() => router.push('/dashboard/purchases'), 2000);
    } finally {
      setIsLoadingDownload(false);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    setDownloadingFiles((prev) => new Set(prev).add(fileName));

    try {
      // Open download in new tab
      window.open(fileUrl, '_blank');
      success(`Downloading ${fileName}...`, 'Success');

      // Reload download data to update download count
      setTimeout(() => {
        loadDownloadLinks();
      }, 1000);
    } catch (error) {
      console.error('Download failed:', error);
      showError('Failed to download file', 'Error');
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileName);
        return newSet;
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconColors: Record<string, string> = {
      pdf: 'text-red-600',
      zip: 'text-yellow-600',
      rar: 'text-yellow-600',
      doc: 'text-blue-600',
      docx: 'text-blue-600',
      xls: 'text-green-600',
      xlsx: 'text-green-600',
      ppt: 'text-orange-600',
      pptx: 'text-orange-600',
      jpg: 'text-purple-600',
      jpeg: 'text-purple-600',
      png: 'text-purple-600',
      gif: 'text-purple-600',
      svg: 'text-purple-600',
      mp4: 'text-pink-600',
      mov: 'text-pink-600',
      avi: 'text-pink-600',
      mp3: 'text-indigo-600',
      wav: 'text-indigo-600',
    };

    return iconColors[ext || ''] || 'text-gray-600';
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoadingDownload) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard/purchases"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Purchases
          </Link>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!downloadData || downloadData.files.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard/purchases"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Purchases
          </Link>
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              No files available
            </h3>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              This purchase does not have any downloadable files.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard/purchases"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Purchases
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Download Files</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Download your purchased product files
          </p>
          {downloadData.downloadCount > 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Downloaded {downloadData.downloadCount} time{downloadData.downloadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Download Information
              </h3>
              <p className="mt-1 text-sm text-blue-800 dark:text-blue-400">
                These files are available for download as long as you own this product. Save them to
                your device for offline access.
              </p>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {downloadData.files.map((file, index) => (
              <div
                key={index}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    {/* File Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getFileIcon(
                        file.name
                      )} bg-gray-100 dark:bg-gray-700`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    {/* File Info */}
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(file.url, file.name)}
                    disabled={downloadingFiles.has(file.name)}
                    className="ml-4 px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {downloadingFiles.has(file.name) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                          />
                        </svg>
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download All Button */}
        {downloadData.files.length > 1 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tip: Download files individually for better control
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
