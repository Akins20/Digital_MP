'use client';

/**
 * Create New Product Page
 * Allows sellers to create new products
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import * as productsApi from '@/lib/api/products';
import * as uploadApi from '@/lib/api/upload';
import { IOSButton } from '@/components/ios';
import { ArrowLeft } from 'lucide-react';
import {
  BasicInfoSection,
  PricingSection,
  MediaSection,
  ProductFilesSection,
  TagsSection,
  AdditionalDetailsSection,
} from '@/components/seller/product-form';

export default function CreateProductPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: 'TEMPLATES' as productsApi.ProductCategory,
    tags: [] as string[],
    price: '',
    originalPrice: '',
    currency: 'USD',
    coverImage: '',
    images: [] as string[],
    demoUrl: '',
    requirements: '',
    includesUpdates: false,
    includesSupport: false,
    metaTitle: '',
    metaDescription: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload state
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [productFiles, setProductFiles] = useState<Array<{ name: string; url: string; size: number; type: string; key: string }>>([]);

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'SELLER')) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      if (formData.tags.length >= 10) {
        showError('Maximum 10 tags allowed', 'Error');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageToRemove),
    }));
  };

  // Upload handlers
  const handleCoverImageUpload = async (files: File[]) => {
    if (!token) {
      showError('Authentication required', 'Error');
      return;
    }

    if (files.length === 0) return;

    try {
      setIsUploadingCover(true);
      const response = await uploadApi.uploadImage(token, files[0], 'products/covers');

      if (response.file) {
        setFormData((prev) => ({ ...prev, coverImage: response.file!.url }));
        success('Cover image uploaded successfully', 'Success');
      }
    } catch (error: any) {
      console.error('Failed to upload cover image:', error);
      showError(error.message || 'Failed to upload cover image', 'Error');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAdditionalImagesUpload = async (files: File[]) => {
    if (!token) {
      showError('Authentication required', 'Error');
      return;
    }

    if (files.length === 0) return;

    try {
      setIsUploadingImages(true);
      const response = await uploadApi.uploadImages(token, files, 'products/images');

      if (response.files) {
        const newImageUrls = response.files.map(f => f.url);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImageUrls].slice(0, 10), // Max 10 images
        }));
        success(`${response.files.length} image(s) uploaded successfully`, 'Success');
      }
    } catch (error: any) {
      console.error('Failed to upload images:', error);
      showError(error.message || 'Failed to upload images', 'Error');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleProductFilesUpload = async (files: File[]) => {
    if (!token) {
      showError('Authentication required', 'Error');
      return;
    }

    if (files.length === 0) return;

    try {
      setIsUploadingFiles(true);
      const response = await uploadApi.uploadFiles(token, files, 'products/files');

      if (response.files) {
        // Add 'key' property to each file using the URL as unique identifier
        const filesWithKeys = response.files.map(f => ({
          ...f,
          key: f.url,
        }));
        setProductFiles((prev) => [...prev, ...filesWithKeys]);
        success(`${response.files.length} file(s) uploaded successfully`, 'Success');
      }
    } catch (error: any) {
      console.error('Failed to upload files:', error);
      showError(error.message || 'Failed to upload files', 'Error');
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const handleRemoveProductFile = (key: string) => {
    setProductFiles((prev) => prev.filter(f => f.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showError('Authentication required', 'Error');
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      showError('Product title is required', 'Validation Error');
      return;
    }

    if (!formData.description.trim()) {
      showError('Product description is required', 'Validation Error');
      return;
    }

    if (!formData.coverImage.trim()) {
      showError('Cover image is required', 'Validation Error');
      return;
    }

    if (productFiles.length === 0) {
      showError('At least one product file is required', 'Validation Error');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      showError('Valid price is required', 'Validation Error');
      return;
    }

    try {
      setIsSubmitting(true);

      const productData: productsApi.CreateProductData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim() || null,
        category: formData.category,
        tags: formData.tags,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        currency: formData.currency,
        coverImage: formData.coverImage.trim(),
        images: formData.images,
        files: productFiles.map(f => ({
          url: f.url,
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        demoUrl: formData.demoUrl.trim() || null,
        requirements: formData.requirements.trim() || null,
        includesUpdates: formData.includesUpdates,
        includesSupport: formData.includesSupport,
        metaTitle: formData.metaTitle.trim() || null,
        metaDescription: formData.metaDescription.trim() || null,
      };

      const response = await productsApi.createProduct(token, productData);
      success('Product created successfully!', 'Success');
      router.push('/seller/products');
    } catch (error: any) {
      console.error('Failed to create product:', error);
      showError(error.message || 'Failed to create product', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== 'SELLER') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-orange-900/20 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-ios-orange-500 border-t-transparent"></div>
          <p className="mt-ios-md text-ios-body text-ios-gray-600 dark:text-ios-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-orange-900/20 pt-16">
      <main className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl">
        {/* Header with Actions */}
        <div className="mb-ios-xl animate-ios-fade-in">
          <IOSButton
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="mb-ios-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </IOSButton>

          <div className="flex items-start justify-between gap-ios-lg">
            <div className="flex-1">
              <h1 className="text-ios-large-title font-bold text-gray-900 dark:text-white mb-ios-sm">
                Create New Product
              </h1>
              <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400">
                Add a new digital product to your marketplace
              </p>
            </div>

            <div className="flex gap-ios-sm flex-shrink-0">
              <IOSButton
                type="button"
                onClick={() => router.back()}
                variant="ghost"
                size="md"
                disabled={isSubmitting}
              >
                Cancel
              </IOSButton>

              <IOSButton
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmitting}
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Creating...' : 'Create Product'}
              </IOSButton>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-ios-md">
          {/* Left Column */}
          <div className="space-y-ios-md">
            <BasicInfoSection formData={formData} onChange={handleChange} />

            <PricingSection formData={formData} onChange={handleChange} />

            <MediaSection
              formData={formData}
              onCoverImageUpload={handleCoverImageUpload}
              onAdditionalImagesUpload={handleAdditionalImagesUpload}
              onRemoveImage={handleRemoveImage}
              onChange={handleChange}
              isUploadingCover={isUploadingCover}
              isUploadingImages={isUploadingImages}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-ios-md">
            <ProductFilesSection
              productFiles={productFiles}
              onFilesUpload={handleProductFilesUpload}
              onRemoveFile={handleRemoveProductFile}
              isUploading={isUploadingFiles}
            />

            <TagsSection
              tags={formData.tags}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              maxTags={10}
            />

            <AdditionalDetailsSection formData={formData} onChange={handleChange} />
          </div>
        </form>
      </main>
    </div>
  );
}
