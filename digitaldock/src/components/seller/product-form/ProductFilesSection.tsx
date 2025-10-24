import { useState } from 'react';
import { IOSCard, IOSButton } from '@/components/ios';
import FileUpload from '@/components/FileUpload';
import { Upload, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ProductFile {
  name: string;
  url: string;
  size: number;
  type: string;
  key: string;
}

interface ProductFilesSectionProps {
  productFiles: ProductFile[];
  onFilesUpload: (files: File[]) => Promise<void>;
  onRemoveFile: (key: string) => void;
  isUploading: boolean;
}

export default function ProductFilesSection({
  productFiles,
  onFilesUpload,
  onRemoveFile,
  isUploading,
}: ProductFilesSectionProps) {
  console.log('ProductFilesSection rendering with files:', productFiles);
  const [showSupportedTypes, setShowSupportedTypes] = useState(false);

  return (
    <IOSCard blur padding="md" className="animate-ios-scale-in">
      <div className="flex items-center gap-ios-sm mb-ios-sm">
        <div className="w-10 h-10 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-ios-lg flex items-center justify-center">
          <Upload className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white">
            Product Files *
          </h2>
          <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">
            Files buyers will receive
          </p>
        </div>
      </div>

      <FileUpload
        multiple={true}
        maxSizeMB={500}
        maxFiles={20}
        onFilesSelected={onFilesUpload}
        disabled={isUploading}
        label="Upload Product Files"
        helperText="Max 500MB per file, 20 files max. Supports ZIP, 7Z, RAR, and most file types"
      />

      {/* Supported File Types Info */}
      <div className="mt-ios-xs">
        <div className="p-ios-xs bg-ios-blue-50/50 dark:bg-ios-blue-900/10 rounded-ios-md border border-ios-blue-100 dark:border-ios-blue-900/30">
          <div className="flex items-start justify-between gap-ios-xs">
            <p className="text-ios-caption2 text-ios-blue-700 dark:text-ios-blue-400 flex-1">
              <strong>Supported:</strong> Archives (ZIP, 7Z, RAR, TAR, GZIP), Documents (PDF, Word, Excel),
              Images, Videos, Audio, Code files, Executables, Fonts, and more
            </p>
            <button
              type="button"
              onClick={() => setShowSupportedTypes(!showSupportedTypes)}
              className="text-ios-blue-600 dark:text-ios-blue-400 hover:text-ios-blue-700 dark:hover:text-ios-blue-300 transition-colors flex-shrink-0"
            >
              {showSupportedTypes ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded List */}
        {showSupportedTypes && (
          <div className="mt-ios-xs p-ios-sm bg-ios-gray-50 dark:bg-ios-gray-800 rounded-ios-md border border-ios-gray-200 dark:border-ios-gray-700 text-ios-caption2 text-ios-gray-700 dark:text-ios-gray-300">
            <div className="grid grid-cols-2 gap-ios-xs">
              <div>
                <strong className="text-ios-green-600 dark:text-ios-green-400">Archives:</strong>
                <p>ZIP, 7Z, RAR, TAR, GZIP, BZIP</p>
              </div>
              <div>
                <strong className="text-ios-blue-600 dark:text-ios-blue-400">Documents:</strong>
                <p>PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, RTF</p>
              </div>
              <div>
                <strong className="text-ios-purple-600 dark:text-ios-purple-400">Images:</strong>
                <p>JPG, PNG, GIF, WEBP, SVG, BMP, PSD</p>
              </div>
              <div>
                <strong className="text-ios-orange-600 dark:text-ios-orange-400">Video:</strong>
                <p>MP4, WEBM, MOV, AVI, MPEG</p>
              </div>
              <div>
                <strong className="text-ios-pink-600 dark:text-ios-pink-400">Audio:</strong>
                <p>MP3, WAV, OGG, WEBM</p>
              </div>
              <div>
                <strong className="text-ios-teal-600 dark:text-ios-teal-400">Code:</strong>
                <p>HTML, CSS, JS, JSON, PY, JAVA, PHP, GO, RUST, C, C++</p>
              </div>
              <div>
                <strong className="text-ios-indigo-600 dark:text-ios-indigo-400">Fonts:</strong>
                <p>TTF, OTF, WOFF, WOFF2</p>
              </div>
              <div>
                <strong className="text-ios-red-600 dark:text-ios-red-400">Executables:</strong>
                <p>EXE, DMG, and installers</p>
              </div>
            </div>
            <p className="mt-ios-xs text-ios-caption2 text-ios-gray-600 dark:text-ios-gray-400">
              And many more! Most file types are supported.
            </p>
          </div>
        )}
      </div>
      {isUploading && (
        <div className="mt-ios-sm flex items-center gap-ios-xs text-ios-footnote text-ios-orange-600 dark:text-ios-orange-400">
          <div className="animate-spin h-4 w-4 border-2 border-ios-orange-600 border-t-transparent rounded-full"></div>
          Uploading files...
        </div>
      )}

      {productFiles.length > 0 && (
        <div className="mt-ios-md space-y-ios-xs">
          <p className="text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300">
            Uploaded Files ({productFiles.length})
          </p>
          {productFiles.map((file) => (
            <div
              key={file.key}
              className="flex items-center justify-between p-ios-sm bg-ios-gray-50 dark:bg-ios-gray-800 rounded-ios-lg group"
            >
              <div className="flex items-center gap-ios-sm flex-1 min-w-0">
                <FileText className="w-5 h-5 text-ios-blue-600 dark:text-ios-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-ios-footnote font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-ios-caption2 text-ios-gray-500 dark:text-ios-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(file.key)}
                className="ml-ios-sm p-ios-xs text-ios-red-600 hover:text-ios-red-700 dark:text-ios-red-400 dark:hover:text-ios-red-300 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </IOSCard>
  );
}
