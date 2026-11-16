import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, FolderOpen, Globe, Images, Loader2 } from 'lucide-react';

interface DropzoneProps {
  compact?: boolean;
  onFilesAdded: (files: File[]) => void;
  onLoadSamples: () => Promise<void>;
  onAddFromUrl: (url: string) => Promise<void>;
  onOpenSignUp: () => void;
  onOpenTerms: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  compact = false,
  onFilesAdded,
  onLoadSamples,
  onAddFromUrl,
  onOpenSignUp,
  onOpenTerms,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [samplesLoading, setSamplesLoading] = useState(false);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []).filter(
      (file) =>
        file.type.startsWith('image/') ||
        /\.(jpe?g|png|heic|heif|webp|avif|gif|bmp|tiff?)$/i.test(file.name)
    );
    if (droppedFiles.length > 0) {
      onFilesAdded(droppedFiles);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setUrlError('');
    setUrlLoading(true);
    try {
      await onAddFromUrl(urlInput.trim());
      setUrlInput('');
      setUrlMode(false);
    } catch (err) {
      setUrlError(err instanceof Error ? err.message : 'Unable to load image from this URL.');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleSamplesClick = async () => {
    setMenuOpen(false);
    setSamplesLoading(true);
    try {
      await onLoadSamples();
    } finally {
      setSamplesLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[780px] mx-auto px-4">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/heic,image/heif,image/webp,image/avif,image/gif,image/bmp,image/tiff,.jpg,.jpeg,.png,.heic,.heif,.webp,.avif,.gif,.bmp,.tiff"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Select image files to convert to JPEG"
      />

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-[6px] border-2 border-dashed transition-colors ${
          isDragging
            ? 'bg-[#D1FAE5] border-[#059669]'
            : 'bg-[#ECFDF5] border-[#6EE7B7]'
        } ${compact ? 'py-5 sm:py-6 px-4 sm:px-5' : 'py-10 sm:py-16 px-4 sm:px-6'} text-center`}
      >
        <div className="flex flex-col items-center justify-center">
          {/* Split Select Image Files Button */}
          <div ref={dropdownRef} className="relative inline-flex items-stretch max-w-full">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-[#047857] hover:bg-[#065F46] active:bg-[#064E3B] text-white font-semibold text-[14.5px] sm:text-[15.5px] px-4 sm:px-6 min-h-[46px] py-3 sm:py-3.5 rounded-l-[4px] flex items-center gap-2 sm:gap-2.5 shadow-[0_6px_16px_rgba(4,120,87,0.22)] transition-colors cursor-pointer whitespace-nowrap"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span>{samplesLoading ? 'Loading Samples...' : 'Select Image Files'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="More import sources"
              aria-expanded={menuOpen}
              className="bg-[#047857] hover:bg-[#065F46] active:bg-[#064E3B] text-white px-3.5 min-h-[46px] py-3 sm:py-3.5 rounded-r-[4px] border-l border-white/25 shadow-[0_6px_16px_rgba(4,120,87,0.22)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <ChevronDown className="w-4 h-4 stroke-[2.25]" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-2.5rem)] bg-white border border-[#E5E7EB] rounded-[6px] shadow-[0_12px_28px_rgba(16,24,40,0.12)] py-1.5 z-30 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    inputRef.current?.click();
                  }}
                  className="w-full px-3.5 min-h-[44px] py-2.5 text-[13.5px] font-medium text-[#111827] hover:bg-[#ECFDF5] flex items-center gap-2.5 cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-[#047857] shrink-0" />
                  <span>Pick from Computer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setUrlMode(true);
                    setUrlError('');
                  }}
                  className="w-full px-3.5 min-h-[44px] py-2.5 text-[13.5px] font-medium text-[#111827] hover:bg-[#ECFDF5] flex items-center gap-2.5 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#047857] shrink-0" />
                  <span>Import from Web URL</span>
                </button>
                <button
                  type="button"
                  onClick={handleSamplesClick}
                  className="w-full px-3.5 min-h-[44px] py-2.5 text-[13.5px] font-medium text-[#111827] hover:bg-[#ECFDF5] flex items-center gap-2.5 cursor-pointer"
                >
                  <Images className="w-4 h-4 text-[#047857] shrink-0" />
                  <span>Try Sample Photos</span>
                </button>
              </div>
            )}
          </div>

          {/* Optional Inline URL Import Bar */}
          {urlMode && (
            <form
              onSubmit={handleUrlSubmit}
              className="mt-4 w-full max-w-md flex flex-col gap-2 bg-white p-3 rounded-[4px] border border-[#A7F3D0] shadow-xs"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.png"
                  className="flex-1 min-h-[40px] px-3 py-1.5 text-sm border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857]"
                  required
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={urlLoading}
                    className="flex-1 sm:flex-none min-h-[40px] px-4 py-1.5 text-sm font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px] disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {urlLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Import</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUrlMode(false);
                      setUrlError('');
                    }}
                    className="min-h-[40px] px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:text-[#111827] border border-[#E5E7EB] sm:border-transparent rounded-[4px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {urlError && <p className="text-xs text-[#DC2626] text-left">{urlError}</p>}
            </form>
          )}

          {/* Original Supporting Micro-Copy */}
          <p className="mt-4 text-[13px] sm:text-[13.5px] text-[#374151] leading-relaxed">
            Supports multi-file uploads up to 1GB per image.{' '}
            <button
              type="button"
              onClick={onOpenSignUp}
              className="text-[#047857] font-medium underline hover:text-[#065F46] cursor-pointer"
            >
              Create a free account
            </button>{' '}
            for larger batches.
          </p>

          {!compact && (
            <p className="mt-1.5 text-[11.5px] text-[#4B5563] leading-relaxed">
              Your files are processed privately for image conversion only. Read our{' '}
              <a
                href="/privacy-policy"
                className="underline hover:text-[#047857]"
              >
                Privacy Policy
              </a>{' '}
              and{' '}
              <a
                href="/terms-and-conditions"
                className="underline hover:text-[#047857]"
              >
                Terms and Conditions
              </a>
              .
            </p>
          )}

          {isDragging && (
            <p className="mt-2 text-xs font-semibold text-[#047857]">
              Release to add PNG, HEIC, JPG, WEBP, or AVIF images to the queue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
