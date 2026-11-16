export type TargetFormat = 'jpeg' | 'jpg' | 'png' | 'webp' | 'avif' | 'gif' | 'tiff';

export type ConversionStatus = 'ready' | 'uploading' | 'converting' | 'done' | 'error';

export interface ConversionSettings {
  quality: number;
  width: string;
  height: string;
  targetSizeKb: string;
  stripMetadata: boolean;
  background: string;
}

export interface ConvertedResult {
  id: string;
  fileName: string;
  originalName: string;
  originalFormat: string;
  targetFormat: TargetFormat;
  originalSize: number;
  convertedSize: number;
  width: number;
  height: number;
  mimeType: string;
  downloadUrl: string;
  previewUrl: string;
}

export interface QueuedFile {
  localId: string;
  file: File;
  name: string;
  originalSize: number;
  originalFormat: string;
  previewUrl: string;
  targetFormat: TargetFormat;
  status: ConversionStatus;
  progress: number;
  error?: string;
  result?: ConvertedResult;
}

export interface ConverterPreset {
  id: string;
  title: string;
  breadcrumbLabel: string;
  subtitle: string;
  defaultTarget: TargetFormat;
  defaultQuality: number;
  openSettingsByDefault?: boolean;
}

export interface UserSession {
  name: string;
  email: string;
}
