import React from 'react';
import {
  AlertCircle,
  Archive,
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  Loader2,
  Plus,
  RotateCcw,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import { ConversionSettings, QueuedFile, TargetFormat } from '../types/converter';
import { SUPPORTED_FORMATS, formatBytes, formatSavings } from '../utils/formatters';

interface FileQueueProps {
  files: QueuedFile[];
  batchFormat: TargetFormat;
  settings: ConversionSettings;
  settingsOpen: boolean;
  isBatchConverting: boolean;
  isDownloadingZip: boolean;
  onToggleSettings: () => void;
  onUpdateSettings: (next: Partial<ConversionSettings>) => void;
  onBatchFormatChange: (format: TargetFormat) => void;
  onFileFormatChange: (localId: string, format: TargetFormat) => void;
  onConvertSingle: (localId: string) => void;
  onConvertAll: () => void;
  onDownloadAll: () => void;
  onRemoveFile: (localId: string) => void;
  onClearAll: () => void;
  onCompareFile: (file: QueuedFile) => void;
  onAddMoreClick: () => void;
}

export const FileQueue: React.FC<FileQueueProps> = ({
  files,
  batchFormat,
  settings,
  settingsOpen,
  isBatchConverting,
  isDownloadingZip,
  onToggleSettings,
  onUpdateSettings,
  onBatchFormatChange,
  onFileFormatChange,
  onConvertSingle,
  onConvertAll,
  onDownloadAll,
  onRemoveFile,
  onClearAll,
  onCompareFile,
  onAddMoreClick,
}) => {
  const totalBytes = files.reduce((acc, f) => acc + f.originalSize, 0);
  const readyCount = files.filter((f) => f.status === 'ready' || f.status === 'error').length;
  const doneFiles = files.filter((f) => f.status === 'done' && f.result);
  const activeCount = files.filter((f) => f.status === 'uploading' || f.status === 'converting').length;

  return (
    <section className="w-full max-w-[920px] mx-auto px-4 mt-6 pb-4" aria-label="Image Conversion Queue">
      {/* Top Batch Controls Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-t-[6px] px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[13.5px] text-[#374151] tabular-nums">
          <span className="font-semibold text-[#111827]">
            {files.length} {files.length === 1 ? 'image' : 'images'}
          </span>
          <span aria-hidden="true" className="text-[#9CA3AF]">
            ·
          </span>
          <span>{formatBytes(totalBytes)} total</span>
          {doneFiles.length > 0 && (
            <>
              <span aria-hidden="true" className="text-[#9CA3AF]">
                ·
              </span>
              <span className="text-[#047857] font-medium">
                {doneFiles.length} ready to save
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-[13px] text-[#4B5563]">
            <span className="whitespace-nowrap">Convert all to:</span>
            <select
              value={batchFormat}
              onChange={(e) => onBatchFormatChange(e.target.value as TargetFormat)}
              className="min-h-[40px] sm:min-h-[34px] px-2.5 py-1.5 text-[13px] font-semibold text-[#111827] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857] cursor-pointer"
            >
              {SUPPORTED_FORMATS.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onToggleSettings}
            aria-expanded={settingsOpen}
            className={`min-h-[40px] sm:min-h-[34px] px-3 py-1.5 text-[13px] font-medium rounded-[4px] border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              settingsOpen
                ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#047857]'
                : 'bg-white border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Output Settings</span>
          </button>

          <button
            type="button"
            onClick={onClearAll}
            disabled={isBatchConverting}
            className="min-h-[40px] sm:min-h-[34px] px-2.5 py-1.5 text-[13px] font-medium text-[#6B7280] hover:text-[#DC2626] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Collapsible Advanced Conversion Settings */}
      {settingsOpen && (
        <div className="bg-[#F9FAFB] border-x border-b border-[#E5E7EB] px-4 sm:px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#374151] mb-1.5">
              <label htmlFor="quality-slider">Compression Quality</label>
              <span className="font-mono tabular-nums text-[#047857]">{settings.quality}%</span>
            </div>
            <input
              id="quality-slider"
              type="range"
              min={10}
              max={100}
              value={settings.quality}
              onChange={(e) => onUpdateSettings({ quality: Number(e.target.value) })}
              className="w-full h-6 accent-[#047857] cursor-pointer"
            />
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Smaller values save bandwidth; higher values keep crisp photo texture.
            </p>
          </div>

          <div>
            <label htmlFor="target-size-kb" className="block text-xs font-semibold text-[#374151] mb-1.5">
              Max File Size (KB)
            </label>
            <input
              id="target-size-kb"
              type="number"
              min={5}
              max={50000}
              placeholder="e.g. 50"
              value={settings.targetSizeKb}
              onChange={(e) => onUpdateSettings({ targetSizeKb: e.target.value })}
              className="w-full min-h-[38px] px-2.5 py-1.5 text-xs bg-white border border-[#D1D5DB] rounded-[4px] font-mono tabular-nums focus:outline-none focus:border-[#047857]"
            />
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Optional limit (e.g. 50 KB for exam or ID portals).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1.5">
              Max Width / Height (px)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={8000}
                placeholder="Width"
                value={settings.width}
                onChange={(e) => onUpdateSettings({ width: e.target.value })}
                className="w-full min-h-[38px] px-2.5 py-1.5 text-xs bg-white border border-[#D1D5DB] rounded-[4px] font-mono tabular-nums focus:outline-none focus:border-[#047857]"
              />
              <span className="text-xs text-[#9CA3AF]">×</span>
              <input
                type="number"
                min={1}
                max={8000}
                placeholder="Height"
                value={settings.height}
                onChange={(e) => onUpdateSettings({ height: e.target.value })}
                className="w-full min-h-[38px] px-2.5 py-1.5 text-xs bg-white border border-[#D1D5DB] rounded-[4px] font-mono tabular-nums focus:outline-none focus:border-[#047857]"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Leave empty to preserve original image resolution.
            </p>
          </div>

          <div>
            <label htmlFor="bg-color-input" className="block text-xs font-semibold text-[#374151] mb-1.5">
              Canvas Fill (JPEG)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="bg-color-input"
                type="color"
                value={settings.background}
                onChange={(e) => onUpdateSettings({ background: e.target.value })}
                className="w-9 h-9 rounded-[4px] border border-[#D1D5DB] bg-white p-0.5 cursor-pointer"
              />
              <span className="text-xs font-mono text-[#4B5563] uppercase">
                {settings.background}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#6B7280]">
              Replaces alpha transparency when saving to JPEG.
            </p>
          </div>

          <div className="flex flex-col justify-start">
            <span className="block text-xs font-semibold text-[#374151] mb-2">
              Metadata Privacy
            </span>
            <label className="flex items-start gap-2.5 text-xs text-[#374151] cursor-pointer min-h-[38px] py-1">
              <input
                type="checkbox"
                checked={settings.stripMetadata}
                onChange={(e) => onUpdateSettings({ stripMetadata: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-[#047857] cursor-pointer shrink-0"
              />
              <span>Remove camera EXIF & GPS location data</span>
            </label>
          </div>
        </div>
      )}

      {/* Responsive File Rows / Mobile Conversion Cards */}
      <div className="bg-white border-x border-b border-[#E5E7EB] divide-y divide-[#E5E7EB]">
        {files.map((item) => {
          const isBusy = item.status === 'uploading' || item.status === 'converting';
          const savings = item.result
            ? formatSavings(item.originalSize, item.result.convertedSize)
            : null;

          return (
            <div
              key={item.localId}
              className="px-4 sm:px-5 py-4 md:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 hover:bg-[#F9FAFB] transition-colors"
            >
              {/* Top / Left: Thumbnail + File Name & Metadata + Mobile Remove Button */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 md:w-11 md:h-11 rounded-[4px] border border-[#E5E7EB] bg-[#F3F4F6] overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[14px] font-semibold text-[#111827] truncate"
                    title={item.name}
                  >
                    {item.name}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] text-[#6B7280] tabular-nums">
                    <span>{formatBytes(item.originalSize)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.originalFormat}</span>
                    {item.result && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11.5px] text-[#4B5563]">
                          {item.result.width}×{item.result.height}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile-only remove button in card header corner */}
                <button
                  type="button"
                  onClick={() => onRemoveFile(item.localId)}
                  disabled={isBusy}
                  aria-label={`Remove ${item.name}`}
                  className="md:hidden w-10 h-10 -mr-1.5 flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] rounded-[4px] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Controls Row: Format Selector + Status/Progress + Desktop/Mobile Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                {/* Format + Progress sub-row so they sit side-by-side cleanly on phones */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12.5px] text-[#6B7280]">to</span>
                    <select
                      value={item.targetFormat}
                      disabled={isBusy}
                      onChange={(e) =>
                        onFileFormatChange(item.localId, e.target.value as TargetFormat)
                      }
                      aria-label={`Target format for ${item.name}`}
                      className="min-h-[40px] sm:min-h-[34px] px-2.5 py-1.5 text-[13px] font-semibold text-[#111827] bg-[#F9FAFB] border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857] disabled:opacity-50 cursor-pointer"
                    >
                      {SUPPORTED_FORMATS.map((fmt) => (
                        <option key={fmt.value} value={fmt.value}>
                          {fmt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Progress / Status Column */}
                  <div className="flex-1 sm:w-44 sm:flex-none min-w-0">
                    {item.status === 'ready' && (
                      <span className="text-[12.5px] font-medium text-[#6B7280]">
                        Queued
                      </span>
                    )}

                    {isBusy && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11.5px] font-medium text-[#047857] tabular-nums">
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>
                              {item.status === 'uploading' ? 'Uploading' : 'Converting'}
                            </span>
                          </span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#D1FAE5] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#047857] transition-all duration-150"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {item.status === 'done' && item.result && (
                      <div className="flex flex-col">
                        <span className="text-[12.5px] font-semibold text-[#047857] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Converted</span>
                        </span>
                        <span className="text-[11.5px] text-[#4B5563] tabular-nums truncate">
                          {formatBytes(item.result.convertedSize)}
                          {savings && (
                            <span
                              className={`ml-1.5 font-medium ${
                                savings.isSmaller ? 'text-[#047857]' : 'text-[#6B7280]'
                              }`}
                            >
                              ({savings.label})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {item.status === 'error' && (
                      <span
                        className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1 truncate"
                        title={item.error}
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.error || 'Conversion failed'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Full-width mobile tap targets, compact inline on desktop */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'ready' && (
                    <button
                      type="button"
                      onClick={() => onConvertSingle(item.localId)}
                      className="flex-1 sm:flex-none min-h-[42px] sm:min-h-[34px] px-3.5 py-1.5 text-[13px] sm:text-[12.5px] font-semibold text-[#047857] border border-[#A7F3D0] hover:bg-[#ECFDF5] rounded-[4px] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Convert
                    </button>
                  )}

                  {item.status === 'error' && (
                    <button
                      type="button"
                      onClick={() => onConvertSingle(item.localId)}
                      className="flex-1 sm:flex-none min-h-[42px] sm:min-h-[34px] px-3.5 py-1.5 text-[13px] sm:text-[12.5px] font-semibold text-[#DC2626] border border-[#FCA5A5] hover:bg-[#FEF2F2] rounded-[4px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}

                  {item.status === 'done' && item.result && (
                    <>
                      <button
                        type="button"
                        onClick={() => onCompareFile(item)}
                        title="Inspect before and after preview"
                        aria-label={`Compare ${item.name}`}
                        className="min-h-[42px] min-w-[42px] sm:min-h-[34px] sm:min-w-[34px] p-2 sm:p-1.5 text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-[4px] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={item.result.downloadUrl}
                        download={item.result.fileName}
                        className="flex-1 sm:flex-none min-h-[42px] sm:min-h-[34px] px-4 sm:px-3.5 py-1.5 text-[13px] sm:text-[12.5px] font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </>
                  )}

                  {/* Desktop remove button */}
                  <button
                    type="button"
                    onClick={() => onRemoveFile(item.localId)}
                    disabled={isBusy}
                    aria-label={`Remove ${item.name}`}
                    className="hidden md:flex p-1.5 text-[#9CA3AF] hover:text-[#111827] rounded-[4px] transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Batch Action Bar */}
      <div className="bg-[#F9FAFB] border-x border-b border-[#E5E7EB] rounded-b-[6px] px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAddMoreClick}
          className="min-h-[44px] sm:min-h-[40px] px-3.5 py-2 text-[13.5px] font-medium text-[#374151] bg-white border border-[#D1D5DB] hover:bg-[#ECFDF5] hover:border-[#6EE7B7] rounded-[4px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-[#047857]" />
          <span>Add More Images</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
          {doneFiles.length > 0 && (
            <button
              type="button"
              onClick={onDownloadAll}
              disabled={isDownloadingZip}
              className={`min-h-[44px] px-5 py-2.5 text-[14px] font-semibold rounded-[4px] flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 ${
                readyCount === 0
                  ? 'bg-[#047857] hover:bg-[#065F46] text-white shadow-[0_4px_12px_rgba(4,120,87,0.22)]'
                  : 'bg-white border border-[#047857] text-[#047857] hover:bg-[#ECFDF5]'
              }`}
            >
              {isDownloadingZip ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Archive className="w-4 h-4" />
              )}
              <span>
                {doneFiles.length === 1
                  ? 'Download Image'
                  : `Download All (${doneFiles.length} ZIP)`}
              </span>
            </button>
          )}

          {readyCount > 0 && (
            <button
              type="button"
              onClick={onConvertAll}
              disabled={isBatchConverting || activeCount > 0}
              className="min-h-[44px] px-6 py-2.5 text-[14.5px] font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px] shadow-[0_4px_14px_rgba(4,120,87,0.24)] flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              {isBatchConverting || activeCount > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    Convert {readyCount === 1 ? 'Image' : `${readyCount} Images`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
