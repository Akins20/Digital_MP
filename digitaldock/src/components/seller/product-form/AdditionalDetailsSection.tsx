import { IOSCard, IOSInput } from '@/components/ios';
import { Settings } from 'lucide-react';

interface AdditionalDetailsSectionProps {
  formData: {
    requirements: string;
    includesUpdates: boolean;
    includesSupport: boolean;
    metaTitle: string;
    metaDescription: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function AdditionalDetailsSection({ formData, onChange }: AdditionalDetailsSectionProps) {
  return (
    <IOSCard blur padding="md" className="animate-ios-scale-in" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center gap-ios-sm mb-ios-sm">
        <div className="w-10 h-10 bg-gradient-to-br from-ios-indigo-500 to-ios-blue-500 rounded-ios-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white">
          Additional Details
        </h2>
      </div>

      <div className="space-y-ios-md">
        <div>
          <label className="block text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
            Requirements
          </label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={onChange}
            maxLength={1000}
            rows={3}
            className="w-full px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-ios-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-orange-500/50 focus:border-ios-orange-500 transition-all resize-none"
            placeholder="System requirements, prerequisites, etc."
          />
        </div>

        <div className="flex flex-col gap-ios-sm">
          <label className="flex items-center gap-ios-sm cursor-pointer group">
            <input
              type="checkbox"
              name="includesUpdates"
              checked={formData.includesUpdates}
              onChange={onChange}
              className="w-5 h-5 text-ios-orange-500 border-ios-gray-300 dark:border-ios-gray-600 rounded focus:ring-ios-orange-500"
            />
            <span className="text-ios-body text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Includes Updates
            </span>
          </label>

          <label className="flex items-center gap-ios-sm cursor-pointer group">
            <input
              type="checkbox"
              name="includesSupport"
              checked={formData.includesSupport}
              onChange={onChange}
              className="w-5 h-5 text-ios-orange-500 border-ios-gray-300 dark:border-ios-gray-600 rounded focus:ring-ios-orange-500"
            />
            <span className="text-ios-body text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Includes Support
            </span>
          </label>
        </div>

        {/* SEO Fields */}
        <div className="pt-ios-md border-t border-ios-gray-200 dark:border-ios-gray-700">
          <h3 className="text-ios-title3 font-bold text-gray-900 dark:text-white mb-ios-sm">SEO (optional)</h3>

          <div className="space-y-ios-sm">
            <IOSInput
              label="Meta Title"
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={onChange}
              maxLength={60}
              placeholder="SEO title (max 60 characters)"
            />

            <div>
              <label className="block text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={onChange}
                maxLength={160}
                rows={2}
                className="w-full px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-ios-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-orange-500/50 focus:border-ios-orange-500 transition-all resize-none"
                placeholder="SEO description (max 160 characters)"
              />
            </div>
          </div>
        </div>
      </div>
    </IOSCard>
  );
}
