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
import FileUpload from '@/components/FileUpload';

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

  const [tagInput, setTagInput] = useState('');
  const [imageInput, setImageInput] = useState('');
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

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      if (formData.tags.length >= 10) {
        showError('Maximum 10 tags allowed', 'Error');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddImage = () => {
    const url = imageInput.trim();
    if (url && !formData.images.includes(url)) {
      if (formData.images.length >= 10) {
        showError('Maximum 10 images allowed', 'Error');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
      setImageInput('');
    }
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
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
            Back to Products
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Create New Product</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add a new digital product to your store
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength={200}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  maxLength={300}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={5000}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed product description"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formData.description.length} / 5000 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(productsApi.ProductCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="NGN">NGN</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price * ({formData.currency})
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Original Price (optional)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  For showing discounts
                </p>
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
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
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
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
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
                  name="demoUrl"
                  value={formData.demoUrl}
                  onChange={handleChange}
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

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Tags (max 10)
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Add
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Additional Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Requirements (optional)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="System requirements, prerequisites, etc."
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="includesUpdates"
                    checked={formData.includesUpdates}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Includes Updates
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="includesSupport"
                    checked={formData.includesSupport}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Includes Support
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              SEO (optional)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO title (max 60 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  maxLength={160}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO description (max 160 characters)"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating...
                </span>
              ) : (
                'Create Product'
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
