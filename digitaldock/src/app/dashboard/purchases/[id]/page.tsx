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
import { IOSButton, IOSCard, IOSBadge } from '@/components/ios';
import { ArrowLeft, Download, FileText, Info, Package } from 'lucide-react';

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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/10 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue-500 border-t-transparent"></div>
          <p className="mt-ios-sm text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoadingDownload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/10 pt-16">
        <main className="max-w-4xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-lg">
          <IOSButton
            onClick={() => router.push('/dashboard/purchases')}
            variant="ghost"
            size="sm"
            className="mb-ios-md"
          >
            <ArrowLeft className="w-4 h-4 mr-ios-xs" />
            Back to Purchases
          </IOSButton>
          <div className="flex justify-center items-center py-ios-3xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-ios-blue-500 border-t-transparent"></div>
              <p className="mt-ios-sm text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">Loading files...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!downloadData || downloadData.files.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/10 pt-16">
        <main className="max-w-4xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-lg">
          <IOSButton
            onClick={() => router.push('/dashboard/purchases')}
            variant="ghost"
            size="sm"
            className="mb-ios-md"
          >
            <ArrowLeft className="w-4 h-4 mr-ios-xs" />
            Back to Purchases
          </IOSButton>
          <IOSCard blur padding="md" className="text-center py-ios-3xl animate-ios-fade-in">
            <div className="w-16 h-16 bg-ios-gray-100 dark:bg-ios-gray-800 rounded-full flex items-center justify-center mx-auto mb-ios-md">
              <Package className="w-8 h-8 text-ios-gray-400" />
            </div>
            <h3 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-xs">
              No files available
            </h3>
            <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">
              This purchase does not have any downloadable files.
            </p>
          </IOSCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/10 pt-16">
      <main className="max-w-4xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-lg">
        {/* Back Button */}
        <IOSButton
          onClick={() => router.push('/dashboard/purchases')}
          variant="ghost"
          size="sm"
          className="mb-ios-md animate-ios-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-ios-xs" />
          Back to Purchases
        </IOSButton>

        {/* Header */}
        <div className="mb-ios-lg animate-ios-fade-in" style={{ animationDelay: '100ms' }}>
          <h1 className="text-ios-large-title font-bold text-gray-900 dark:text-white mb-ios-xs">
            Download Files
          </h1>
          <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400">
            Download your purchased product files
          </p>
          {downloadData.downloadCount > 0 && (
            <IOSBadge variant="secondary" className="mt-ios-xs">
              Downloaded {downloadData.downloadCount} time{downloadData.downloadCount > 1 ? 's' : ''}
            </IOSBadge>
          )}
        </div>

        {/* Info Box */}
        <IOSCard
          blur
          padding="sm"
          className="mb-ios-md bg-ios-blue-50/80 dark:bg-ios-blue-900/20 border-ios-blue-200 dark:border-ios-blue-800 animate-ios-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          <div className="flex items-start gap-ios-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-ios-blue-500 to-ios-cyan-500 rounded-ios-md flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-ios-footnote font-semibold text-ios-blue-900 dark:text-ios-blue-300 mb-1">
                Download Information
              </h3>
              <p className="text-ios-caption1 text-ios-blue-800 dark:text-ios-blue-400">
                These files are available for download as long as you own this product. Save them to
                your device for offline access.
              </p>
            </div>
          </div>
        </IOSCard>

        {/* Files List */}
        <IOSCard blur padding="none" className="overflow-hidden animate-ios-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="divide-y divide-ios-gray-200 dark:divide-ios-gray-700">
            {downloadData.files.map((file, index) => (
              <div
                key={index}
                className="p-ios-md hover:bg-ios-gray-50 dark:hover:bg-ios-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-ios-sm">
                  {/* File Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-ios-md flex items-center justify-center shadow-ios-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-footnote font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-ios-caption1 text-ios-gray-500 dark:text-ios-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  {/* Download Button */}
                  <IOSButton
                    onClick={() => handleDownload(file.url, file.name)}
                    disabled={downloadingFiles.has(file.name)}
                    variant="primary"
                    size="sm"
                    className="flex-shrink-0"
                    loading={downloadingFiles.has(file.name)}
                  >
                    {downloadingFiles.has(file.name) ? (
                      'Downloading...'
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-ios-xs" />
                        Download
                      </>
                    )}
                  </IOSButton>
                </div>
              </div>
            ))}
          </div>
        </IOSCard>

        {/* Tip */}
        {downloadData.files.length > 1 && (
          <div className="mt-ios-md text-center animate-ios-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">
              Tip: Download files individually for better control
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
