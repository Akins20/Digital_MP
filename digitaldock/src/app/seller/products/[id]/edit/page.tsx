'use client';

/**
 * Product Edit Page
 * Edit existing product with iOS styling
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error: showError } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<productsApi.Product | null>(null);

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
    status: 'DRAFT' as productsApi.ProductStatus,
  });

  // Upload state
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [productFiles, setProductFiles] = useState<Array<{ name: string; url: string; size: number; type: string; key: string }>>([]);

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'SELLER')) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Load product
  useEffect(() => {
    if (token && params.id) {
      loadProduct();
    }
  }, [token, params.id]);

  const loadProduct = async () => {
    if (!token || !params.id) return;

    try {
      setIsLoading(true);
      const response = await productsApi.getProduct(params.id as string, token);
      const prod = response.product;

      // Check if user owns this product
      if (prod.seller.id !== user?.id) {
        showError('You do not have permission to edit this product', 'Forbidden');
        router.push('/seller/products');
        return;
      }

      setProduct(prod);
      setFormData({
        title: prod.title,
        shortDescription: prod.shortDescription || '',
        description: prod.description,
        category: prod.category,
        tags: prod.tags,
        price: prod.price.toString(),
        originalPrice: prod.originalPrice?.toString() || '',
        currency: prod.currency,
        coverImage: prod.coverImage,
        images: prod.images || [],
        demoUrl: prod.demoUrl || '',
        requirements: prod.requirements || '',
        includesUpdates: prod.includesUpdates,
        includesSupport: prod.includesSupport,
        metaTitle: prod.metaTitle || '',
        metaDescription: prod.metaDescription || '',
        status: prod.status,
      });

      // Load existing product files
      if (prod.files && prod.files.length > 0) {
        console.log('Loading product files:', prod.files);
        const files = prod.files.map(f => ({
          name: f.name,
          url: f.url,
          size: f.size,
          type: f.type,
          key: f.url, // Use URL as unique key
        }));
        console.log('Mapped product files:', files);
        setProductFiles(files);
      } else {
        console.log('No product files found');
      }
    } catch (error: any) {
      console.error('Failed to load product:', error);
      showError(error.message || 'Failed to load product', 'Error');
      router.push('/seller/products');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent, statusOverride?: productsApi.ProductStatus) => {
    e.preventDefault();

    if (!token || !params.id) {
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
      setIsSaving(true);

      const updateData: productsApi.UpdateProductData = {
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
        status: statusOverride || formData.status,
      };

      await productsApi.updateProduct(token, params.id as string, updateData);
      success('Product updated successfully!', 'Success');
      router.push('/seller/products');
    } catch (error: any) {
      console.error('Failed to update product:', error);
      showError(error.message || 'Failed to update product', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-orange-900/20 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-ios-orange-500 border-t-transparent"></div>
          <p className="mt-ios-md text-ios-body text-ios-gray-600 dark:text-ios-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-orange-900/20 flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-md">Product Not Found</h1>
          <IOSButton onClick={() => router.push('/seller/products')} variant="primary">
            Back to Products
          </IOSButton>
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
                Edit Product
              </h1>
              <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400">
                Update your product information
              </p>
            </div>

            <div className="flex gap-ios-sm flex-shrink-0">
              <IOSButton
                type="button"
                onClick={() => router.back()}
                variant="ghost"
                size="md"
                disabled={isSaving}
              >
                Cancel
              </IOSButton>

              {formData.status === 'DRAFT' && (
                <IOSButton
                  type="button"
                  onClick={(e) => handleSubmit(e as any, productsApi.ProductStatus.PUBLISHED)}
                  variant="primary"
                  size="md"
                  loading={isSaving}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-ios-green-500 to-ios-green-600 hover:from-ios-green-600 hover:to-ios-green-700"
                >
                  {isSaving ? 'Publishing...' : 'Save & Publish'}
                </IOSButton>
              )}

              <IOSButton
                type="submit"
                variant="primary"
                size="md"
                loading={isSaving}
                disabled={isSaving}
                onClick={handleSubmit}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
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

            {/* Status Section */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-ios-md rounded-ios-2xl border border-ios-gray-200/50 dark:border-ios-gray-700/50 p-ios-md shadow-ios-sm animate-ios-scale-in" style={{ animationDelay: '150ms' }}>
              <h3 className="text-ios-title3 font-bold text-gray-900 dark:text-white mb-ios-sm">
                Publication Status
              </h3>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-orange-500/50 focus:border-ios-orange-500 transition-all"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <p className="text-ios-caption1 text-ios-gray-500 dark:text-ios-gray-400 mt-ios-xs">
                {formData.status === 'DRAFT' && 'Product is not visible to customers'}
                {formData.status === 'PUBLISHED' && 'Product is live and visible to customers'}
                {formData.status === 'ARCHIVED' && 'Product is hidden from marketplace'}
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
