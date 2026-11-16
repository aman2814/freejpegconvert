import JSZip from 'jszip';
import { ConversionSettings, ConvertedResult, TargetFormat } from '../types/converter';

interface ConvertRequestOptions {
  file: File;
  targetFormat: TargetFormat;
  settings: ConversionSettings;
  onProgress: (percent: number, phase: 'uploading' | 'converting') => void;
}

export async function convertImageFile({
  file,
  targetFormat,
  settings,
  onProgress,
}: ConvertRequestOptions): Promise<ConvertedResult> {
  try {
    return await uploadAndConvertViaServer({ file, targetFormat, settings, onProgress });
  } catch (serverErr) {
    if (serverErr instanceof Error && serverErr.message.startsWith('SERVER_REJECTED:')) {
      throw new Error(serverErr.message.replace('SERVER_REJECTED:', '').trim());
    }
    return await convertViaCanvasFallback({ file, targetFormat, settings, onProgress });
  }
}

function uploadAndConvertViaServer({
  file,
  targetFormat,
  settings,
  onProgress,
}: ConvertRequestOptions): Promise<ConvertedResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetFormat', targetFormat);
    formData.append('quality', String(settings.quality));
    if (settings.width.trim()) formData.append('width', settings.width.trim());
    if (settings.height.trim()) formData.append('height', settings.height.trim());
    if (settings.targetSizeKb.trim()) formData.append('targetSizeKb', settings.targetSizeKb.trim());
    formData.append('stripMetadata', String(settings.stripMetadata));
    formData.append('background', settings.background);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/convert', true);

    let processingTimer: number | null = null;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const uploadPct = Math.round((event.loaded / event.total) * 65);
        onProgress(Math.max(8, uploadPct), 'uploading');
        if (event.loaded >= event.total && processingTimer === null) {
          let current = 70;
          onProgress(current, 'converting');
          processingTimer = window.setInterval(() => {
            current = Math.min(94, current + 4);
            onProgress(current, 'converting');
          }, 120);
        }
      }
    };

    xhr.onload = () => {
      if (processingTimer !== null) window.clearInterval(processingTimer);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as ConvertedResult;
          onProgress(100, 'converting');
          resolve(data);
        } catch {
          reject(new Error('SERVER_REJECTED: Invalid response from conversion server.'));
        }
      } else if (xhr.status === 404 || xhr.status === 501 || xhr.status === 405) {
        // Edge / static deployment without native sharp server: fall back seamlessly to browser engine
        reject(new Error('EDGE_FALLBACK'));
      } else {
        let message = 'Failed to convert image.';
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed?.error) message = parsed.error;
        } catch {
          // ignore parse failure
        }
        reject(new Error(`SERVER_REJECTED: ${message}`));
      }
    };

    xhr.onerror = () => {
      if (processingTimer !== null) window.clearInterval(processingTimer);
      reject(new Error('Network error during conversion.'));
    };

    onProgress(5, 'uploading');
    xhr.send(formData);
  });
}

async function decodeImageSource(file: File): Promise<{
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  release: () => void;
}> {
  try {
    const bitmap = await createImageBitmap(file);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, w, h) => {
        ctx.drawImage(bitmap, 0, 0, w, h);
      },
      release: () => {
        bitmap.close();
      },
    };
  } catch {
    const objectUrl = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Could not decode this image file in the browser.'));
      el.src = objectUrl;
    }).catch((err) => {
      URL.revokeObjectURL(objectUrl);
      throw err;
    });
    return {
      width: img.naturalWidth || 1200,
      height: img.naturalHeight || 800,
      draw: (ctx, w, h) => {
        ctx.drawImage(img, 0, 0, w, h);
      },
      release: () => {
        URL.revokeObjectURL(objectUrl);
      },
    };
  }
}

function renderCanvasBlob(
  source: { draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void },
  width: number,
  height: number,
  targetFormat: TargetFormat,
  background: string,
  mimeType: string,
  qualityPct: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas 2D context unavailable.'));

  if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
    ctx.fillStyle = background || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
  source.draw(ctx, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas encoding failed.'))),
      mimeType,
      Math.max(0.1, Math.min(1, qualityPct / 100))
    );
  });
}

async function convertViaCanvasFallback({
  file,
  targetFormat,
  settings,
  onProgress,
}: ConvertRequestOptions): Promise<ConvertedResult> {
  if (targetFormat === 'avif' || targetFormat === 'tiff' || targetFormat === 'gif') {
    throw new Error(`Format ${targetFormat.toUpperCase()} requires the Node.js Sharp conversion server.`);
  }

  onProgress(35, 'converting');
  const source = await decodeImageSource(file);

  try {
    let targetWidth = source.width;
    let targetHeight = source.height;
    const maxW = Number(settings.width) || 0;
    const maxH = Number(settings.height) || 0;

    if (maxW > 0 || maxH > 0) {
      const scaleW = maxW > 0 ? maxW / source.width : 1;
      const scaleH = maxH > 0 ? maxH / source.height : 1;
      const scale = Math.min(
        1,
        maxW > 0 && maxH > 0 ? Math.min(scaleW, scaleH) : maxW > 0 ? scaleW : scaleH
      );
      targetWidth = Math.max(1, Math.round(source.width * scale));
      targetHeight = Math.max(1, Math.round(source.height * scale));
    }

    const mimeType =
      targetFormat === 'jpeg' || targetFormat === 'jpg'
        ? 'image/jpeg'
        : targetFormat === 'webp'
        ? 'image/webp'
        : 'image/png';

    let blob = await renderCanvasBlob(
      source,
      targetWidth,
      targetHeight,
      targetFormat,
      settings.background,
      mimeType,
      settings.quality
    );

    const targetKb = Number(settings.targetSizeKb) || 0;
    if (targetKb >= 5) {
      const targetBytes = targetKb * 1024;
      for (const q of [72, 56, 42, 30, 20, 12]) {
        if (blob.size <= targetBytes) break;
        if (q >= settings.quality) continue;
        blob = await renderCanvasBlob(
          source,
          targetWidth,
          targetHeight,
          targetFormat,
          settings.background,
          mimeType,
          q
        );
      }
      for (const scale of [0.8, 0.65, 0.5, 0.35, 0.25]) {
        if (blob.size <= targetBytes) break;
        targetWidth = Math.max(32, Math.round(source.width * scale));
        targetHeight = Math.max(32, Math.round(source.height * scale));
        blob = await renderCanvasBlob(
          source,
          targetWidth,
          targetHeight,
          targetFormat,
          settings.background,
          mimeType,
          Math.min(settings.quality, 45)
        );
      }
    }

    onProgress(100, 'converting');
    const blobUrl = URL.createObjectURL(blob);
    const ext = targetFormat;
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';

    return {
      id: `local-${crypto.randomUUID()}`,
      fileName: `${baseName}.${ext}`,
      originalName: file.name,
      originalFormat: file.type.split('/')[1] || 'image',
      targetFormat,
      originalSize: file.size,
      convertedSize: blob.size,
      width: targetWidth,
      height: targetHeight,
      mimeType,
      downloadUrl: blobUrl,
      previewUrl: blobUrl,
    };
  } finally {
    source.release();
  }
}

export async function downloadZipBundle(results: ConvertedResult[]): Promise<void> {
  const serverIds = results.filter((r) => !r.id.startsWith('local-')).map((r) => r.id);

  if (serverIds.length === results.length && serverIds.length > 0) {
    const response = await fetch('/api/download-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: serverIds }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to build ZIP bundle.');
    }

    const blob = await response.blob();
    triggerBlobDownload(blob, 'free-jpeg-converter-images.zip');
    return;
  }

  // Client-side ZIP assembly using JSZip for edge/static environments
  const zip = new JSZip();
  const usedNames = new Map<string, number>();

  for (const res of results) {
    const fileBlob = await fetch(res.downloadUrl).then((r) => r.blob());
    const count = usedNames.get(res.fileName) || 0;
    let finalName = res.fileName;
    if (count > 0) {
      const dotIdx = finalName.lastIndexOf('.');
      finalName =
        dotIdx > 0
          ? `${finalName.slice(0, dotIdx)} (${count})${finalName.slice(dotIdx)}`
          : `${finalName} (${count})`;
    }
    usedNames.set(res.fileName, count + 1);
    zip.file(finalName, fileBlob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  triggerBlobDownload(zipBlob, 'free-jpeg-converter-images.zip');
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
