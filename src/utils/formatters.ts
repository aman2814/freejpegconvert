import { ConverterPreset, TargetFormat } from '../types/converter';

export const SUPPORTED_FORMATS: { value: TargetFormat; label: string }[] = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'jpg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WEBP' },
  { value: 'avif', label: 'AVIF' },
  { value: 'gif', label: 'GIF' },
  { value: 'tiff', label: 'TIFF' },
];

export const CONVERTER_PRESETS: Record<string, ConverterPreset> = {
  jpeg: {
    id: 'jpeg',
    title: 'Free JPEG Converter',
    breadcrumbLabel: 'JPEG Converter',
    subtitle:
      'Use our fast JPEG image converter to convert PNG to JPEG, convert HEIC to JPEG, or convert JPEG to JPG format online.',
    defaultTarget: 'jpeg',
    defaultQuality: 88,
  },
  'jpeg-to-jpg': {
    id: 'jpeg-to-jpg',
    title: 'JPEG to JPG Converter',
    breadcrumbLabel: 'JPEG to JPG Converter',
    subtitle:
      'Convert image JPEG to JPG format effortlessly for legacy software, upload forms, and universal compatibility.',
    defaultTarget: 'jpg',
    defaultQuality: 92,
  },
  'jpg-to-jpeg': {
    id: 'jpg-to-jpeg',
    title: 'JPG to JPEG Format Converter',
    breadcrumbLabel: 'JPG to JPEG Converter',
    subtitle:
      'A fast JPG to JPEG format converter to standardize photo extensions and optimize file compression.',
    defaultTarget: 'jpeg',
    defaultQuality: 90,
  },
  'png-to-jpeg': {
    id: 'png-to-jpeg',
    title: 'Convert PNG to JPEG',
    breadcrumbLabel: 'PNG to JPEG',
    subtitle:
      'Convert PNG to JPEG with automatic background flattening and smaller, web-ready file sizes.',
    defaultTarget: 'jpeg',
    defaultQuality: 88,
  },
  'heic-to-jpeg': {
    id: 'heic-to-jpeg',
    title: 'Convert HEIC to JPEG',
    breadcrumbLabel: 'HEIC to JPEG',
    subtitle:
      'Convert HEIC to JPEG directly from iPhone and Apple Photos for instant sharing on any device.',
    defaultTarget: 'jpeg',
    defaultQuality: 90,
  },
  png: {
    id: 'png',
    title: 'PNG Image Converter',
    breadcrumbLabel: 'PNG Image Converter',
    subtitle: 'Transform lossless PNG graphics into web-ready JPEG, JPG, WEBP, or AVIF files.',
    defaultTarget: 'jpeg',
    defaultQuality: 90,
  },
  webp: {
    id: 'webp',
    title: 'WEBP Image Converter',
    breadcrumbLabel: 'WEBP Image Converter',
    subtitle: 'Re-encode modern WEBP assets into universally compatible JPEG or PNG photos.',
    defaultTarget: 'jpeg',
    defaultQuality: 88,
  },
  avif: {
    id: 'avif',
    title: 'AVIF Image Converter',
    breadcrumbLabel: 'AVIF Image Converter',
    subtitle: 'Convert high-efficiency AVIF images or export existing photos into AVIF.',
    defaultTarget: 'avif',
    defaultQuality: 82,
  },
  'jpg-to-png': {
    id: 'jpg-to-png',
    title: 'JPG to PNG Converter',
    breadcrumbLabel: 'JPG to PNG',
    subtitle: 'Export JPEG and JPG photographs as lossless PNG files ready for editing and print.',
    defaultTarget: 'png',
    defaultQuality: 95,
  },
  'png-to-jpg': {
    id: 'png-to-jpg',
    title: 'PNG to JPG Converter',
    breadcrumbLabel: 'PNG to JPG',
    subtitle: 'Convert heavy PNG screenshots and graphics into fast-loading JPG photos.',
    defaultTarget: 'jpg',
    defaultQuality: 88,
  },
  'compress-jpeg': {
    id: 'compress-jpeg',
    title: 'JPEG Size Optimizer',
    breadcrumbLabel: 'JPEG Optimizer',
    subtitle: 'Trim excess JPEG kilobytes with MozJPEG encoding while keeping details sharp.',
    defaultTarget: 'jpeg',
    defaultQuality: 74,
    openSettingsByDefault: true,
  },
  'compress-png': {
    id: 'compress-png',
    title: 'PNG Size Optimizer',
    breadcrumbLabel: 'PNG Optimizer',
    subtitle: 'Reduce PNG payloads using smart palette quantization and lossless filtering.',
    defaultTarget: 'png',
    defaultQuality: 78,
    openSettingsByDefault: true,
  },
  'compress-webp': {
    id: 'compress-webp',
    title: 'WEBP Size Optimizer',
    breadcrumbLabel: 'WEBP Optimizer',
    subtitle: 'Shrink WEBP images for faster page loads and leaner mobile delivery.',
    defaultTarget: 'webp',
    defaultQuality: 75,
    openSettingsByDefault: true,
  },
  resize: {
    id: 'resize',
    title: 'Batch Image Resizer',
    breadcrumbLabel: 'Image Resizer',
    subtitle: 'Scale down oversized photos to exact pixel limits and convert formats in one pass.',
    defaultTarget: 'jpeg',
    defaultQuality: 88,
    openSettingsByDefault: true,
  },
};

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, exponent);
  return `${value >= 100 || exponent === 0 ? value.toFixed(0) : value.toFixed(2)} ${units[exponent]}`;
}

export function detectImageFormat(file: File): string {
  const mime = (file.type || '').toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'jpg') return 'JPG';
  if (ext === 'jpeg' || mime.includes('jpeg')) return 'JPEG';
  if (mime.includes('heic') || ext === 'heic') return 'HEIC';
  if (mime.includes('heif') || ext === 'heif') return 'HEIF';
  if (mime.includes('png') || ext === 'png') return 'PNG';
  if (mime.includes('webp') || ext === 'webp') return 'WEBP';
  if (mime.includes('avif') || ext === 'avif') return 'AVIF';
  if (mime.includes('gif') || ext === 'gif') return 'GIF';
  if (mime.includes('tiff') || ext === 'tiff' || ext === 'tif') return 'TIFF';
  if (mime.includes('bmp') || ext === 'bmp') return 'BMP';

  return ext.toUpperCase() || 'IMAGE';
}

export function pickInitialTargetFormat(
  originalFormat: string,
  presetId: string,
  presetDefault: TargetFormat
): TargetFormat {
  if (
    presetId.startsWith('compress-') ||
    presetId === 'jpeg-to-jpg' ||
    presetId === 'jpg-to-jpeg' ||
    presetId === 'png-to-jpeg' ||
    presetId === 'heic-to-jpeg'
  ) {
    return presetDefault;
  }
  const normalizedOriginal = originalFormat.toLowerCase();
  if (presetId === 'jpeg') {
    // On Free JPEG Converter: JPEG inputs default to JPG (.jpg), JPG/PNG/HEIC/WEBP inputs default to JPEG (.jpeg)
    return normalizedOriginal === 'jpeg' ? 'jpg' : 'jpeg';
  }
  if (normalizedOriginal === presetDefault) {
    return presetDefault === 'jpeg' ? 'png' : 'jpeg';
  }
  return presetDefault;
}

export function formatSavings(
  originalSize: number,
  convertedSize: number
): { label: string; isSmaller: boolean } {
  if (originalSize <= 0) return { label: '0%', isSmaller: false };
  const diffPct = Math.round(((convertedSize - originalSize) / originalSize) * 100);
  if (diffPct < 0) {
    return { label: `${diffPct}%`, isSmaller: true };
  }
  if (diffPct > 0) {
    return { label: `+${diffPct}%`, isSmaller: false };
  }
  return { label: '0%', isSmaller: true };
}
