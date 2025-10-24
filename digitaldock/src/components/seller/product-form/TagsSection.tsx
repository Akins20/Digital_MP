import { useState } from 'react';
import { IOSCard, IOSButton } from '@/components/ios';
import { Tag as TagIcon, X } from 'lucide-react';

interface TagsSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  maxTags?: number;
}

export default function TagsSection({ tags, onAddTag, onRemoveTag, maxTags = 10 }: TagsSectionProps) {
  const [tagInput, setTagInput] = useState('');

  const handleAdd = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onAddTag(tag);
      setTagInput('');
    }
  };

  return (
    <IOSCard blur padding="md" className="animate-ios-scale-in" style={{ animationDelay: '50ms' }}>
      <div className="flex items-center gap-ios-sm mb-ios-sm">
        <div className="w-10 h-10 bg-gradient-to-br from-ios-purple-500 to-ios-pink-500 rounded-ios-lg flex items-center justify-center">
          <TagIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white">
            Tags
          </h2>
          <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">
            {tags.length} / {maxTags}
          </p>
        </div>
      </div>

      <div className="flex gap-ios-sm">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          disabled={tags.length >= maxTags}
          className="flex-1 px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-ios-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-orange-500/50 focus:border-ios-orange-500 transition-all disabled:opacity-50"
          placeholder="Add a tag"
        />
        <IOSButton
          type="button"
          onClick={handleAdd}
          variant="primary"
          size="sm"
          disabled={tags.length >= maxTags || !tagInput.trim()}
        >
          Add
        </IOSButton>
      </div>

      {tags.length > 0 && (
        <div className="mt-ios-sm flex flex-wrap gap-ios-xs">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-ios-xs px-ios-sm py-ios-xs bg-ios-orange-100 dark:bg-ios-orange-900/30 text-ios-orange-700 dark:text-ios-orange-300 rounded-ios-lg text-ios-caption1 font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:text-ios-orange-900 dark:hover:text-ios-orange-100 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </IOSCard>
  );
}
