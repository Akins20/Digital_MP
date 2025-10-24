'use client';

/**
 * Product Edit Page
 * Edit existing product
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import * as productsApi from '@/lib/api/products';
import * as uploadApi from '@/lib/api/upload';
import FileUpload from '@/components/FileUpload';

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
    shortDescription: '',
    description: '',
    category: 'EBOOKS' as productsApi.ProductCategory,
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
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
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
      const response = await productsApi.getProduct(params.id as string);
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
        status: prod.status,
      });

      // Load existing product files
      if (prod.files && prod.files.length > 0) {
        setProductFiles(prod.files.map(f => ({ ...f, key: f.url })));
      }
    } catch (error: any) {
      console.error('Failed to load product:', error);
      showError(error.message || 'Failed to load product', 'Error');
      router.push('/seller/products');
    } finally {
      setIsLoading(false);
    }
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
        setProductFiles((prev) => [...prev, ...response.files!]);
        success(`${response.files.length} file(s) uploaded successfully`, 'Success');
      }
    } catch (error: any) {
      console.error('Failed to upload files:', error);
      showError(error.message || 'Failed to upload files', 'Error');
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageToRemove),
    }));
  };

  const handleRemoveProductFile = (key: string) => {
    setProductFiles((prev) => prev.filter(f => f.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent, statusOverride?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    e.preventDefault();

    if (!token || !params.id) {
      showError('Authentication required', 'Error');
      return;
    }

    try {
      setIsSaving(true);

      const updateData: productsApi.UpdateProductData = {
        title: formData.title,
        shortDescription: formData.shortDescription || undefined,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        currency: formData.currency,
        coverImage: formData.coverImage,
        images: formData.images,
        files: productFiles.map(f => ({
          url: f.url,
          name: f.name,
          size: f.size,
          type: f.type,
        })),
        demoUrl: formData.demoUrl || undefined,
        requirements: formData.requirements || undefined,
        includesUpdates: formData.includesUpdates,
        includesSupport: formData.includesSupport,
        status: (statusOverride || formData.status) as productsApi.ProductStatus,
      };

      await productsApi.updateProduct(token, params.id as string, updateData);
      success('Product updated successfully', 'Success');
      router.push('/seller/products');
    } catch (error: any) {
      console.error('Failed to update product:', error);
      showError(error.message || 'Failed to update product', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const tag = input.value.trim();

      if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
        input.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url && formData.images.length < 10) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h1>
          <Link
            href="/seller/products"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const categories = [
    { value: 'EBOOKS', label: 'E-Books' },
    { value: 'TEMPLATES', label: 'Templates' },
    { value: 'GRAPHICS', label: 'Graphics' },
    { value: 'SOFTWARE', label: 'Software' },
    { value: 'COURSES', label: 'Courses' },
    { value: 'MUSIC', label: 'Music' },
    { value: 'VIDEOS', label: 'Videos' },
    { value: 'PHOTOGRAPHY', label: 'Photography' },
    { value: 'FONTS', label: 'Fonts' },
    { value: 'PRESETS', label: 'Presets' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/seller/products"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 inline-block"
          >
            ← Back to Products
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Update your product information</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product title"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description (optional)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  maxLength={5000}
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed product description"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as productsApi.ProductCategory })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (max 10)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  onKeyDown={handleTagInput}
                  disabled={formData.tags.length >= 10}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  placeholder="Type and press Enter or comma to add tags"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original Price
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="For discounts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Media</h2>

            <div className="space-y-6">
              {/* Cover Image Upload */}
              <div>
                <FileUpload
                  accept="image/*"
                  multiple={false}
                  maxSizeMB={5}
                  maxFiles={1}
                  onFilesSelected={handleCoverImageUpload}
                  disabled={isUploadingCover}
                  label="Cover Image *"
                  helperText="Upload a cover image for your product (max 5MB)"
                />
                {isUploadingCover && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Uploading...
                  </div>
                )}
                {formData.coverImage && (
                  <div className="mt-3">
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
              </div>

              {/* Additional Images Upload */}
              <div>
                <FileUpload
                  accept="image/*"
                  multiple={true}
                  maxSizeMB={5}
                  maxFiles={10 - formData.images.length}
                  onFilesSelected={handleAdditionalImagesUpload}
                  disabled={isUploadingImages || formData.images.length >= 10}
                  label="Additional Images (optional)"
                  helperText={`Upload additional product images (${formData.images.length}/10)`}
                />
                {isUploadingImages && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Uploading...
                  </div>
                )}
                {formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border border-gray-200 dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(image)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Demo URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Demo URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://demo.example.com"
                />
              </div>
            </div>
          </div>

          {/* Product Files */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Product Files *
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload the digital files that buyers will receive after purchase
            </p>

            <FileUpload
              multiple={true}
              maxSizeMB={100}
              maxFiles={20}
              onFilesSelected={handleProductFilesUpload}
              disabled={isUploadingFiles}
              label="Upload Product Files"
              helperText="Upload the files buyers will download (max 100MB per file, 20 files max)"
            />
            {isUploadingFiles && (
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Uploading files...
              </div>
            )}

            {productFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uploaded Files ({productFiles.length})
                </p>
                {productFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg
                        className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProductFile(file.key)}
                      className="ml-2 p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Additional Information
            </h2>

            <div className="space-y-4">
              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requirements
                </label>
                <textarea
                  maxLength={1000}
                  rows={3}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="System requirements or prerequisites"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includesUpdates}
                    onChange={(e) => setFormData({ ...formData, includesUpdates: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Includes Updates
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.includesSupport}
                    onChange={(e) => setFormData({ ...formData, includesSupport: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Includes Support
                  </span>
                </label>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Link
              href="/seller/products"
              className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
            >
              Cancel
            </Link>

            {formData.status === 'DRAFT' && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any, 'PUBLISHED')}
                disabled={isSaving}
                className="px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
              >
                {isSaving ? 'Publishing...' : 'Save & Publish'}
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
