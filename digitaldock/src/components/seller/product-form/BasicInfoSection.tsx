import { IOSCard, IOSInput } from '@/components/ios';
import { FileText } from 'lucide-react';
import * as productsApi from '@/lib/api/products';

interface BasicInfoSectionProps {
  formData: {
    title: string;
    shortDescription: string;
    description: string;
    category: productsApi.ProductCategory;
    currency: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function BasicInfoSection({ formData, onChange }: BasicInfoSectionProps) {
  return (
    <IOSCard blur padding="md" className="animate-ios-scale-in">
      <div className="flex items-center gap-ios-sm mb-ios-sm">
        <div className="w-10 h-10 bg-gradient-to-br from-ios-orange-500 to-ios-green-500 rounded-ios-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white">
          Basic Information
        </h2>
      </div>

      <div className="space-y-ios-sm">
        <IOSInput
          label="Product Title *"
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          maxLength={200}
          required
          placeholder="Enter product title"
        />

        <IOSInput
          label="Short Description"
          type="text"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={onChange}
          maxLength={300}
          placeholder="Brief description (optional)"
        />

        <div>
          <label className="block text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
            Full Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            maxLength={5000}
            required
            rows={4}
            className="w-full px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-ios-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-orange-500/50 focus:border-ios-orange-500 transition-all resize-none"
            placeholder="Detailed product description"
          />
          <p className="mt-ios-xs text-ios-caption1 text-ios-gray-500 dark:text-ios-gray-400">
            {formData.description.length} / 5000
          </p>
        </div>

        <div className="grid grid-cols-2 gap-ios-sm">
          <div>
            <label className="block text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={onChange}
              required
              className="w-full px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-orange-500/50 focus:border-ios-orange-500 transition-all"
            >
              {Object.values(productsApi.ProductCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={onChange}
              className="w-full px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-orange-500/50 focus:border-ios-orange-500 transition-all"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="NGN">NGN</option>
            </select>
          </div>
        </div>
      </div>
    </IOSCard>
  );
}
