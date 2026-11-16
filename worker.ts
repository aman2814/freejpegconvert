interface AssetsBinding {
  fetch(input: Request | string): Promise<Response>;
}

export interface Env {
  ASSETS: AssetsBinding;
  APP_URL?: string;
}

interface RouteMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

const MPA_ROUTES: Record<string, RouteMeta> = {
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
    ogDescription: 'Reach the Free JPEG Converter support team for help, feedback, and inquiries.',
  },
};

function normalizeRoutePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function getOrigin(request: Request, env: Env): string {
  const envUrl = env.APP_URL?.trim().replace(/\/+$/, '');
  if (envUrl && envUrl.startsWith('http')) return envUrl;
  return new URL(request.url).origin;
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

function buildSitemapXml(origin: string): string {
  const today = new Date().toISOString().split('T')[0];
  const entries = [
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
}

function buildSampleSvg(kind: string): { svg: string; filename: string } {
  if (kind === 'landscape') {
    return {
      filename: 'mountain-sunrise.svg',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#047857"/><stop offset="55%" stop-color="#34D399"/><stop offset="100%" stop-color="#FEF3C7"/></linearGradient></defs><rect width="1200" height="800" fill="url(#sky)"/><circle cx="880" cy="240" r="85" fill="#FEF3C7" opacity="0.92"/><path d="M0 620 L260 360 L490 540 L780 290 L1080 560 L1200 470 L1200 800 L0 800 Z" fill="#065F46" opacity="0.88"/><path d="M0 680 L340 480 L640 660 L920 440 L1200 630 L1200 800 L0 800 Z" fill="#064E3B"/></svg>`,
    };
  }
  if (kind === 'badge') {
    return {
      filename: 'studio-emblem.svg',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900"><rect x="110" y="110" width="680" height="680" rx="160" fill="#047857"/><circle cx="450" cy="450" r="210" fill="none" stroke="#FFFFFF" stroke-width="36" stroke-dasharray="44 26"/><path d="M360 455 L425 520 L555 375" fill="none" stroke="#FFFFFF" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    };
  }
  return {
    filename: 'geometric-poster.svg',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="750" viewBox="0 0 1000 750"><rect width="1000" height="750" fill="#F8FAFC"/><circle cx="330" cy="375" r="210" fill="#047857" opacity="0.9"/><rect x="460" y="185" width="350" height="380" rx="28" fill="#111827" opacity="0.92"/><circle cx="635" cy="375" r="95" fill="#A7F3D0"/></svg>`,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const routePath = normalizeRoutePath(url.pathname);
    const origin = getOrigin(request, env);

    if (routePath === '/api/health') {
      return Response.json({ ok: true, runtime: 'cloudflare-workers' });
    }

    if (routePath === '/robots.txt' || routePath === '/robot.txt') {
      return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (routePath === '/sitemap.xml' || routePath === '/sitemap.mxl') {
      return new Response(buildSitemapXml(origin), {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      });
    }

    if (routePath.startsWith('/api/sample/')) {
      const kind = routePath.replace('/api/sample/', '');
      const sample = buildSampleSvg(kind);
      return new Response(sample.svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'X-Sample-Filename': sample.filename,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    if (routePath === '/api/fetch-url' && request.method === 'POST') {
      try {
        const body = (await request.json().catch(() => ({}))) as { url?: string };
        const rawUrl = String(body.url || '').trim();
        const parsed = new URL(rawUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return Response.json({ error: 'Only HTTP and HTTPS URLs are supported.' }, { status: 400 });
        }
        const upstream = await fetch(parsed.toString());
        if (!upstream.ok) {
          return Response.json({ error: `Remote server returned status ${upstream.status}.` }, { status: 400 });
        }
        const contentType = upstream.headers.get('content-type') || '';
        if (!contentType.startsWith('image/')) {
          return Response.json({ error: 'URL did not return a valid image file.' }, { status: 400 });
        }
        const data = await upstream.arrayBuffer();
        if (data.byteLength > 25 * 1024 * 1024) {
          return Response.json({ error: 'Remote image exceeds the 25MB URL fetch limit.' }, { status: 400 });
        }
        const fileName = parsed.pathname.split('/').pop() || 'remote-image.jpg';
        return new Response(data, {
          headers: {
            'Content-Type': contentType,
            'X-File-Name': fileName,
          },
        });
      } catch {
        return Response.json({ error: 'Unable to fetch image from the provided URL.' }, { status: 400 });
      }
    }

    if (routePath === '/api/contact' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as {
        name?: string;
        email?: string;
        topic?: string;
        message?: string;
      };
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim();
      const message = String(body.message || '').trim();
      if (!name || !email || !email.includes('@') || message.length < 10) {
        return Response.json(
          { error: 'Please enter your name, a valid email address, and a message (at least 10 characters).' },
          { status: 400 }
        );
      }
      const ticketId = `FJC-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
      return Response.json({ ok: true, ticketId });
    }

    // Signal client-side converter to handle encoding on Cloudflare Workers edge runtime
    if (routePath === '/api/convert') {
      return Response.json(
        { error: 'Edge fallback enabled', fallback: true },
        { status: 501, headers: { 'X-Client-Fallback': '1' } }
      );
    }

    // Serve static build assets directly if requested (e.g., /assets/*, /favicon.*)
    const isFileExtension = /\.[a-zA-Z0-9]+$/.test(url.pathname);
    if (isFileExtension) {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status !== 404) return assetRes;
    }

    // Serve MPA HTML routes with per-route SEO meta tags and canonical URLs
    const indexResponse = await env.ASSETS.fetch(new Request(new URL('/index.html', url).toString()));
    if (!indexResponse.ok) {
      return new Response('Application build assets not found.', { status: 404 });
    }
    const rawHtml = await indexResponse.text();
    const { html, status } = injectRouteMeta(rawHtml, routePath, origin);
    return new Response(html, {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  },
};
