import { IOSCard, IOSInput } from '@/components/ios';

interface PricingSectionProps {
  formData: {
    price: string;
    originalPrice: string;
    currency: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PricingSection({ formData, onChange }: PricingSectionProps) {
  return (
    <IOSCard blur padding="md" className="animate-ios-scale-in" style={{ animationDelay: '50ms' }}>
      <h3 className="text-ios-title3 font-bold text-gray-900 dark:text-white mb-ios-sm">Pricing</h3>

      <div className="grid grid-cols-2 gap-ios-sm">
        <IOSInput
          label={`Price * (${formData.currency})`}
          type="number"
          name="price"
          value={formData.price}
          onChange={onChange}
          min="0"
          step="0.01"
          required
          placeholder="0.00"
        />

        <div>
          <IOSInput
            label="Original Price"
            type="number"
            name="originalPrice"
            value={formData.originalPrice}
            onChange={onChange}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
          <p className="mt-ios-xs text-ios-caption2 text-ios-gray-500 dark:text-ios-gray-400">
            For showing discounts
          </p>
        </div>
      </div>
    </IOSCard>
  );
}
