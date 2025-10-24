import { IOSCard, IOSInput } from '@/components/ios';
import FileUpload from '@/components/FileUpload';
import { Image as ImageIcon, X } from 'lucide-react';

interface MediaSectionProps {
  formData: {
    coverImage: string;
    images: string[];
    demoUrl: string;
  };
  onCoverImageUpload: (files: File[]) => Promise<void>;
  onAdditionalImagesUpload: (files: File[]) => Promise<void>;
  onRemoveImage: (image: string) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploadingCover: boolean;
  isUploadingImages: boolean;
}

export default function MediaSection({
  formData,
  onCoverImageUpload,
  onAdditionalImagesUpload,
  onRemoveImage,
  onChange,
  isUploadingCover,
  isUploadingImages,
}: MediaSectionProps) {
  return (
    <IOSCard blur padding="md" className="animate-ios-scale-in">
      <div className="flex items-center gap-ios-sm mb-ios-sm">
        <div className="w-10 h-10 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-ios-lg flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white">
          Media
        </h2>
      </div>

      <div className="space-y-ios-md">
        {/* Cover Image Upload */}
        <div>
          <FileUpload
            accept="image/*"
            multiple={false}
            maxSizeMB={5}
            maxFiles={1}
            onFilesSelected={onCoverImageUpload}
            disabled={isUploadingCover}
            label="Cover Image *"
            helperText="Upload a cover image (max 5MB)"
          />
          {isUploadingCover && (
            <div className="mt-ios-sm flex items-center gap-ios-xs text-ios-footnote text-ios-orange-600 dark:text-ios-orange-400">
              <div className="animate-spin h-4 w-4 border-2 border-ios-orange-600 border-t-transparent rounded-full"></div>
              Uploading...
            </div>
          )}
          {formData.coverImage && (
            <div className="mt-ios-sm">
              <img
                src={formData.coverImage}
                alt="Cover preview"
                className="w-full h-32 object-cover rounded-ios-lg border-2 border-ios-gray-200 dark:border-ios-gray-700"
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
            onFilesSelected={onAdditionalImagesUpload}
            disabled={isUploadingImages || formData.images.length >= 10}
            label="Additional Images"
            helperText={`Upload additional images (${formData.images.length}/10)`}
          />
          {isUploadingImages && (
            <div className="mt-ios-sm flex items-center gap-ios-xs text-ios-footnote text-ios-orange-600 dark:text-ios-orange-400">
              <div className="animate-spin h-4 w-4 border-2 border-ios-orange-600 border-t-transparent rounded-full"></div>
              Uploading...
            </div>
          )}
          {formData.images.length > 0 && (
            <div className="mt-ios-sm grid grid-cols-3 gap-ios-xs">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-20 object-cover rounded-ios-lg border border-ios-gray-200 dark:border-ios-gray-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(image)}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-ios-red-500 hover:bg-ios-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-ios-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Demo URL */}
        <IOSInput
          label="Demo URL"
          type="url"
          name="demoUrl"
          value={formData.demoUrl}
          onChange={onChange}
          placeholder="https://demo.example.com"
        />
      </div>
    </IOSCard>
  );
}
