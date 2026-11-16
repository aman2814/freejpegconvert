import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import JSZip from 'jszip';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { createServer as createViteServer } from 'vite';

interface StoredConvertedFile {
  id: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  createdAt: number;
}

const MAX_STORE_ITEMS = 120;
const STORE_TTL_MS = 30 * 60 * 1000;
const convertedStore = new Map<string, StoredConvertedFile>();

function pruneStore() {
  const now = Date.now();
  for (const [key, item] of convertedStore.entries()) {
    if (now - item.createdAt > STORE_TTL_MS) {
      convertedStore.delete(key);
    }
  }
  while (convertedStore.size > MAX_STORE_ITEMS) {
    const oldestKey = convertedStore.keys().next().value;
    if (!oldestKey) break;
    convertedStore.delete(oldestKey);
  }
}

const MIME_BY_FORMAT: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  tiff: 'image/tiff',
};

const EXT_BY_FORMAT: Record<string, string> = {
  jpeg: 'jpeg',
  jpg: 'jpg',
  png: 'png',
  webp: 'webp',
  avif: 'avif',
  gif: 'gif',
  tiff: 'tiff',
};

function sanitizeBaseName(originalName: string): string {
  const parsed = path.parse(originalName);
  const clean = (parsed.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
  return clean || 'image';
}

function normalizeFormat(raw: unknown): string {
  const val = String(raw || 'jpeg').toLowerCase().trim();
  if (val in MIME_BY_FORMAT) return val;
  return 'jpeg';
}

function parseOptionalInt(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.min(8000, Math.round(n));
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB practical in-memory upload limit per file
    },
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Generate clean sample images on demand so users can test conversions with one click
  app.get('/api/sample/:kind', async (req, res) => {
    try {
      const kind = req.params.kind;
      let svg = '';
      let format: 'jpeg' | 'png' | 'webp' = 'jpeg';
      let filename = 'sample.jpg';

      if (kind === 'landscape') {
        format = 'jpeg';
        filename = 'mountain-sunrise.jpg';
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#4F46E5"/>
              <stop offset="55%" stop-color="#818CF8"/>
              <stop offset="100%" stop-color="#FDE68A"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="800" fill="url(#sky)"/>
          <circle cx="880" cy="240" r="85" fill="#FEF3C7" opacity="0.92"/>
          <path d="M0 620 L260 360 L490 540 L780 290 L1080 560 L1200 470 L1200 800 L0 800 Z" fill="#312E81" opacity="0.88"/>
          <path d="M0 680 L340 480 L640 660 L920 440 L1200 630 L1200 800 L0 800 Z" fill="#1E1B4B"/>
        </svg>`;
      } else if (kind === 'badge') {
        format = 'png';
        filename = 'studio-emblem.png';
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
          <rect width="900" height="900" fill="none"/>
          <rect x="110" y="110" width="680" height="680" rx="160" fill="#636EE6"/>
          <circle cx="450" cy="450" r="210" fill="none" stroke="#FFFFFF" stroke-width="36" stroke-dasharray="44 26"/>
          <path d="M360 455 L425 520 L555 375" fill="none" stroke="#FFFFFF" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      } else {
        format = 'webp';
        filename = 'geometric-poster.webp';
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="750" viewBox="0 0 1000 750">
          <rect width="1000" height="750" fill="#F8FAFC"/>
          <circle cx="330" cy="375" r="210" fill="#636EE6" opacity="0.9"/>
          <rect x="460" y="185" width="350" height="380" rx="28" fill="#1E293B" opacity="0.92"/>
          <circle cx="635" cy="375" r="95" fill="#A5B4FC"/>
        </svg>`;
      }

      const buffer = await sharp(Buffer.from(svg))
        .toFormat(format, { quality: 90 })
        .toBuffer();

      res.setHeader('Content-Type', MIME_BY_FORMAT[format]);
      res.setHeader('X-Sample-Filename', filename);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(buffer);
    } catch (err) {
      console.error('Sample generation error:', err);
      res.status(500).json({ error: 'Failed to generate sample image.' });
    }
  });

  // Fetch an image from a remote URL safely
  app.post('/api/fetch-url', async (req, res) => {
    try {
      const rawUrl = String(req.body?.url || '').trim();
      if (!rawUrl) {
        res.status(400).json({ error: 'Please provide an image URL.' });
        return;
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(rawUrl);
      } catch {
        res.status(400).json({ error: 'Invalid URL format.' });
        return;
      }

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported.' });
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(parsedUrl.toString(), { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        res.status(400).json({ error: `Remote server returned status ${response.status}.` });
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) {
        res.status(400).json({ error: 'URL did not return a valid image file.' });
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buf = Buffer.from(arrayBuffer);
      if (buf.length > 25 * 1024 * 1024) {
        res.status(400).json({ error: 'Remote image exceeds the 25MB URL fetch limit.' });
        return;
      }

      const pathnameBase = path.basename(parsedUrl.pathname) || 'remote-image.jpg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('X-File-Name', pathnameBase);
      res.send(buf);
    } catch (err) {
      console.error('URL fetch error:', err);
      res.status(500).json({ error: 'Unable to fetch image from the provided URL.' });
    }
  });

  // Server-side image conversion endpoint powered by sharp
  app.post('/api/convert', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file was uploaded.' });
        return;
      }

      const targetFormat = normalizeFormat(req.body?.targetFormat);
      const rawQuality = Number(req.body?.quality ?? 88);
      const quality = Number.isFinite(rawQuality) ? Math.min(100, Math.max(1, Math.round(rawQuality))) : 88;
      const width = parseOptionalInt(req.body?.width);
      const height = parseOptionalInt(req.body?.height);
      const targetSizeKb = parseOptionalInt(req.body?.targetSizeKb);
      const stripMetadata = String(req.body?.stripMetadata ?? 'true') !== 'false';
      const background = /^#[0-9a-fA-F]{6}$/.test(String(req.body?.background || ''))
        ? String(req.body.background)
        : '#ffffff';

      const baseSharp = sharp(req.file.buffer, {
        animated: targetFormat === 'gif' || targetFormat === 'webp',
      });
      const inputMeta = await baseSharp.metadata();
      const baseWidth = width || inputMeta.width || 1600;
      const baseHeight = height || inputMeta.height || 1600;

      const buildBuffer = async (q: number, scaleFactor = 1): Promise<Buffer> => {
        let pipeline = sharp(req.file!.buffer, {
          animated: targetFormat === 'gif' || targetFormat === 'webp',
        }).rotate();

        if (width || height || scaleFactor < 1) {
          const scaledW = Math.max(32, Math.round(baseWidth * scaleFactor));
          const scaledH = Math.max(32, Math.round(baseHeight * scaleFactor));
          pipeline = pipeline.resize({
            width: width || scaleFactor < 1 ? scaledW : undefined,
            height: height || scaleFactor < 1 ? scaledH : undefined,
            fit: 'inside',
            withoutEnlargement: true,
          });
        }

        if (!stripMetadata) {
          pipeline = pipeline.keepMetadata();
        }

        if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
          pipeline = pipeline.flatten({ background }).jpeg({ quality: q, mozjpeg: true });
        } else if (targetFormat === 'png') {
          pipeline = pipeline.png({
            compressionLevel: 9,
            quality: q,
            palette: q < 92,
          });
        } else if (targetFormat === 'webp') {
          pipeline = pipeline.webp({ quality: q });
        } else if (targetFormat === 'avif') {
          pipeline = pipeline.avif({ quality: q });
        } else if (targetFormat === 'gif') {
          pipeline = pipeline.gif();
        } else if (targetFormat === 'tiff') {
          pipeline = pipeline.tiff({ quality: q });
        }

        return pipeline.toBuffer();
      };

      let outputBuffer = await buildBuffer(quality, 1);

      if (targetSizeKb && targetSizeKb >= 5) {
        const targetBytes = targetSizeKb * 1024;
        const qualitySteps = [72, 56, 42, 30, 20, 12].filter((q) => q < quality);
        for (const q of qualitySteps) {
          if (outputBuffer.length <= targetBytes) break;
          outputBuffer = await buildBuffer(q, 1);
        }
        const scaleSteps = [0.8, 0.65, 0.5, 0.35, 0.25];
        for (const scale of scaleSteps) {
          if (outputBuffer.length <= targetBytes) break;
          outputBuffer = await buildBuffer(Math.min(quality, 45), scale);
        }
      }

      const outputMeta = await sharp(outputBuffer).metadata();

      const baseName = sanitizeBaseName(req.file.originalname);
      const ext = EXT_BY_FORMAT[targetFormat] || 'png';
      const fileName = `${baseName}.${ext}`;
      const mimeType = MIME_BY_FORMAT[targetFormat] || 'image/png';
      const id = crypto.randomUUID();

      pruneStore();
      convertedStore.set(id, {
        id,
        fileName,
        mimeType,
        buffer: outputBuffer,
        createdAt: Date.now(),
      });

      res.json({
        id,
        fileName,
        originalName: req.file.originalname,
        originalFormat: inputMeta.format || 'unknown',
        targetFormat,
        originalSize: req.file.size,
        convertedSize: outputBuffer.length,
        width: outputMeta.width || inputMeta.width || 0,
        height: outputMeta.height || inputMeta.height || 0,
        mimeType,
        downloadUrl: `/api/download/${id}`,
        previewUrl: `/api/preview/${id}`,
      });
    } catch (err) {
      console.error('Image conversion error:', err);
      res.status(422).json({
        error: 'Could not process this image file. Ensure it is a valid PNG, JPEG, JPG, HEIC, WEBP, GIF, or AVIF image.',
      });
    }
  });

  app.get('/api/preview/:id', (req, res) => {
    pruneStore();
    const item = convertedStore.get(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Converted preview expired or not found.' });
      return;
    }
    res.setHeader('Content-Type', item.mimeType);
    res.setHeader('Cache-Control', 'private, max-age=1800');
    res.send(item.buffer);
  });

  app.get('/api/download/:id', (req, res) => {
    pruneStore();
    const item = convertedStore.get(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Converted file expired or not found.' });
      return;
    }
    res.setHeader('Content-Type', item.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${item.fileName}"`);
    res.setHeader('Content-Length', String(item.buffer.length));
    res.send(item.buffer);
  });

  app.post('/api/download-all', async (req, res) => {
    try {
      pruneStore();
      const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
      if (ids.length === 0) {
        res.status(400).json({ error: 'No converted files selected.' });
        return;
      }

      const zip = new JSZip();
      const usedNames = new Map<string, number>();
      let addedCount = 0;

      for (const id of ids) {
        const item = convertedStore.get(String(id));
        if (!item) continue;

        let finalName = item.fileName;
        const count = usedNames.get(finalName) || 0;
        if (count > 0) {
          const parsed = path.parse(finalName);
          finalName = `${parsed.name} (${count})${parsed.ext}`;
        }
        usedNames.set(item.fileName, count + 1);

        zip.file(finalName, item.buffer);
        addedCount += 1;
      }

      if (addedCount === 0) {
        res.status(404).json({ error: 'Converted files expired. Please re-convert your files.' });
        return;
      }

      const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="free-jpeg-converter-images.zip"');
      res.setHeader('Content-Length', String(zipBuffer.length));
      res.send(zipBuffer);
    } catch (err) {
      console.error('ZIP bundle error:', err);
      res.status(500).json({ error: 'Failed to create ZIP archive.' });
    }
  });

  // Contact form submission endpoint for /contact-us
  app.post('/api/contact', (req, res) => {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const topic = String(req.body?.topic || 'General Support').trim();
    const message = String(req.body?.message || '').trim();

    if (!name || !email || !email.includes('@') || message.length < 10) {
      res.status(400).json({
        error: 'Please enter your name, a valid email address, and a message (at least 10 characters).',
      });
      return;
    }

    const ticketId = `FJC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    console.log(`[Contact] ${ticketId} | ${topic} | ${name} <${email}>`);
    res.json({ ok: true, ticketId });
  });

  const MPA_ROUTES: Record<
    string,
    { title: string; description: string; ogTitle: string; ogDescription: string }
  > = {
    '/': {
      title: 'Free JPEG Converter – Convert PNG, HEIC & JPG to JPEG Online',
      description:
        'Use our free JPEG converter to convert to JPEG, convert PNG to JPEG, convert HEIC to JPEG, or convert JPEG to JPG format online with fast batch ZIP downloads.',
      ogTitle: 'Free JPEG Converter – Convert PNG, HEIC & JPG to JPEG Online',
      ogDescription:
        'Fast online JPEG image converter to convert PNG to JPEG, convert HEIC to JPEG, or convert image JPEG to JPG format in seconds.',
    },
    '/about-us': {
      title: 'About Us – Free JPEG Converter',
      description:
        'Learn how Free JPEG Converter delivers fast, private MozJPEG image conversion across mobile and desktop browsers with ephemeral memory handling.',
      ogTitle: 'About Us – Free JPEG Converter',
      ogDescription:
        'Learn about our mission, MozJPEG conversion engine, and privacy-first image processing standards.',
    },
    '/privacy-policy': {
      title: 'Privacy Policy – Free JPEG Converter',
      description:
        'Read the Free JPEG Converter Privacy Policy covering temporary 30-minute memory retention, EXIF metadata stripping, and contact data handling.',
      ogTitle: 'Privacy Policy – Free JPEG Converter',
      ogDescription:
        'How Free JPEG Converter handles uploaded photos, EXIF stripping, temporary retention, and user privacy.',
    },
    '/terms-and-conditions': {
      title: 'Terms and Conditions – Free JPEG Converter',
      description:
        'Review the Terms and Conditions for using Free JPEG Converter, including file ownership rights, acceptable use, and service limits.',
      ogTitle: 'Terms and Conditions – Free JPEG Converter',
      ogDescription:
        'Terms and Conditions governing image uploads, copyright ownership, and usage of Free JPEG Converter.',
    },
    '/contact-us': {
      title: 'Contact Us – Free JPEG Converter',
      description:
        'Get in touch with the Free JPEG Converter team for support, format requests, bug reports, or privacy inquiries.',
      ogTitle: 'Contact Us – Free JPEG Converter',
      ogDescription:
        'Reach the Free JPEG Converter support team for help, feedback, and inquiries.',
    },
  };

  function normalizeRoutePath(rawPath: string): string {
    const clean = rawPath.split('?')[0].replace(/\/+$/, '') || '/';
    return clean;
  }

  function injectRouteMeta(rawHtml: string, routePath: string, origin: string): { html: string; status: number } {
    const meta = MPA_ROUTES[routePath] || MPA_ROUTES['/'];
    const isKnown = routePath in MPA_ROUTES;
    const canonicalUrl = `${origin}${routePath === '/' ? '/' : routePath}`;

    let html = rawHtml
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`)
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${meta.description}" />`
      )
      .replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${meta.ogTitle}" />`
      )
      .replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:description" content="${meta.ogDescription}" />`
      )
      .replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:title" content="${meta.ogTitle}" />`
      )
      .replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:description" content="${meta.ogDescription}" />`
      );

    const canonicalTag = `    <link rel="canonical" href="${canonicalUrl}" />\n    <meta property="og:url" content="${canonicalUrl}" />`;
    html = html.replace('</head>', `${canonicalTag}\n  </head>`);

    return { html, status: isKnown ? 200 : 404 };
  }

  const getOrigin = (req: express.Request): string => {
    const envUrl = process.env.APP_URL?.trim().replace(/\/+$/, '');
    if (envUrl && envUrl.startsWith('http')) return envUrl;
    return `${req.protocol}://${req.get('host') || `localhost:${PORT}`}`;
  };

  app.get(['/robots.txt', '/robot.txt'], (req, res) => {
    const origin = getOrigin(req);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);
  });

  const buildSitemapXml = (origin: string): string => {
    const today = new Date().toISOString().split('T')[0];
    const entries: Array<{ loc: string; changefreq: string; priority: string }> = [
      { loc: `${origin}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${origin}/?tool=jpeg-to-jpg`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${origin}/?tool=jpg-to-jpeg`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${origin}/?tool=png-to-jpeg`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${origin}/?tool=heic-to-jpeg`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${origin}/?tool=webp`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${origin}/?tool=compress-jpeg`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${origin}/about-us`, changefreq: 'monthly', priority: '0.7' },
      { loc: `${origin}/privacy-policy`, changefreq: 'monthly', priority: '0.7' },
      { loc: `${origin}/terms-and-conditions`, changefreq: 'monthly', priority: '0.7' },
      { loc: `${origin}/contact-us`, changefreq: 'monthly', priority: '0.7' },
    ];

    const urls = entries
      .map(
        (entry) =>
          `  <url>\n    <loc>${entry.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  };

  app.get(['/sitemap.xml', '/sitemap.mxl'], (req, res) => {
    const origin = getOrigin(req);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(buildSitemapXml(origin));
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      try {
        const routePath = normalizeRoutePath(req.originalUrl);
        if (routePath.startsWith('/api/')) {
          next();
          return;
        }
        const indexTemplatePath = path.resolve(process.cwd(), 'index.html');
        const rawTemplate = fs.readFileSync(indexTemplatePath, 'utf-8');
        const origin = `${req.protocol}://${req.get('host') || `localhost:${PORT}`}`;
        const { html: seoHtml, status } = injectRouteMeta(rawTemplate, routePath, origin);
        const transformedHtml = await vite.transformIndexHtml(req.originalUrl, seoHtml);
        res.status(status).setHeader('Content-Type', 'text/html').send(transformedHtml);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (req, res) => {
      const indexHtmlPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexHtmlPath)) {
        res.status(404).send('Build output not found.');
        return;
      }
      const routePath = normalizeRoutePath(req.originalUrl);
      const rawHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      const origin = `${req.protocol}://${req.get('host') || `localhost:${PORT}`}`;
      const { html: seoHtml, status } = injectRouteMeta(rawHtml, routePath, origin);
      res.status(status).setHeader('Content-Type', 'text/html').send(seoHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Free JPEG Converter server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
