import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Dropzone } from './components/Dropzone';
import { FileQueue } from './components/FileQueue';
import {
  ApiModal,
  AuthModal,
  CompareModal,
  PricingModal,
  SearchModal,
  TermsModal,
} from './components/Modals';
import { Navbar } from './components/Navbar';
import { SeoSection } from './components/SeoSection';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import {
  ConversionSettings,
  QueuedFile,
  TargetFormat,
  UserSession,
} from './types/converter';
import { convertImageFile, downloadZipBundle } from './utils/conversionClient';
import {
  CONVERTER_PRESETS,
  detectImageFormat,
  pickInitialTargetFormat,
} from './utils/formatters';

const USER_STORAGE_KEY = 'free_jpeg_converter_user_session';

function getInitialPath(): string {
  const clean = window.location.pathname.replace(/\/+$/, '') || '/';
  return clean;
}

function getInitialPresetId(): string {
  const toolParam = new URLSearchParams(window.location.search).get('tool') || 'jpeg';
  return toolParam in CONVERTER_PRESETS ? toolParam : 'jpeg';
}

export default function App() {
  const [currentPath] = useState<string>(getInitialPath);
  const [activePresetId, setActivePresetId] = useState<string>(getInitialPresetId);
  const activePreset = CONVERTER_PRESETS[activePresetId] || CONVERTER_PRESETS.jpeg;

  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [batchFormat, setBatchFormat] = useState<TargetFormat>(activePreset.defaultTarget);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: activePreset.defaultQuality,
    width: '',
    height: '',
    targetSizeKb: '',
    stripMetadata: true,
    background: '#ffffff',
  });
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [isBatchConverting, setIsBatchConverting] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const [bannerError, setBannerError] = useState<string>('');

  // Modal states
  const [compareTarget, setCompareTarget] = useState<QueuedFile | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [pricingOpen, setPricingOpen] = useState<boolean>(false);
  const [apiOpen, setApiOpen] = useState<boolean>(false);
  const [termsOpen, setTermsOpen] = useState<boolean>(false);

  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as UserSession) : null;
    } catch {
      return null;
    }
  });

  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<QueuedFile[]>(files);
  filesRef.current = files;

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => {
        if (f.previewUrl.startsWith('blob:')) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, []);

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      if (currentPath !== '/') {
        window.location.assign(presetId === 'jpeg' ? '/' : `/?tool=${encodeURIComponent(presetId)}`);
        return;
      }
      const preset = CONVERTER_PRESETS[presetId] || CONVERTER_PRESETS.jpeg;
      setActivePresetId(preset.id);
      setBatchFormat(preset.defaultTarget);
      setSettings((prev) => ({
        ...prev,
        quality: preset.defaultQuality,
      }));
      if (preset.openSettingsByDefault) {
        setSettingsOpen(true);
      }
      const nextUrl = preset.id === 'jpeg' ? '/' : `/?tool=${encodeURIComponent(preset.id)}`;
      window.history.replaceState({}, '', nextUrl);
      setFiles((prev) =>
        prev.map((item) =>
          item.status === 'ready'
            ? {
                ...item,
                targetFormat: pickInitialTargetFormat(
                  item.originalFormat,
                  preset.id,
                  preset.defaultTarget
                ),
              }
            : item
        )
      );
    },
    [currentPath]
  );

  const handleFilesAdded = useCallback(
    (incoming: File[]) => {
      setBannerError('');
      const validImages = incoming.filter(
        (file) =>
          file.type.startsWith('image/') ||
          /\.(jpe?g|png|heic|heif|webp|avif|gif|bmp|tiff?)$/i.test(file.name)
      );

      if (validImages.length === 0) {
        setBannerError(
          'Please choose supported image files (JPEG, JPG, PNG, HEIC, WEBP, AVIF, GIF, or TIFF).'
        );
        return;
      }

      const newItems: QueuedFile[] = validImages.map((file) => {
        const originalFormat = detectImageFormat(file);
        const targetFormat = pickInitialTargetFormat(
          originalFormat,
          activePresetId,
          batchFormat
        );
        return {
          localId: crypto.randomUUID(),
          file,
          name: file.name,
          originalSize: file.size,
          originalFormat,
          previewUrl: URL.createObjectURL(file),
          targetFormat,
          status: 'ready',
          progress: 0,
        };
      });

      setFiles((prev) => [...prev, ...newItems]);
    },
    [activePresetId, batchFormat]
  );

  const handleLoadSamples = useCallback(async () => {
    setBannerError('');
    try {
      const sampleKinds = ['landscape', 'badge', 'poster'];
      const fetchedFiles: File[] = [];

      for (const kind of sampleKinds) {
        const res = await fetch(`/api/sample/${kind}`);
        if (!res.ok) continue;
        const blob = await res.blob();
        const filename =
          res.headers.get('X-Sample-Filename') ||
          `sample-${kind}.${blob.type.split('/')[1] || 'jpg'}`;
        fetchedFiles.push(new File([blob], filename, { type: blob.type }));
      }

      if (fetchedFiles.length > 0) {
        handleFilesAdded(fetchedFiles);
      } else {
        setBannerError('Sample photos could not be loaded right now.');
      }
    } catch {
      setBannerError('Sample photos could not be loaded right now.');
    }
  }, [handleFilesAdded]);

  const handleAddFromUrl = useCallback(
    async (url: string) => {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Could not import the image from that URL.');
      }

      const blob = await res.blob();
      const rawName = res.headers.get('X-File-Name') || 'imported-photo.jpg';
      const file = new File([blob], rawName, { type: blob.type || 'image/jpeg' });
      handleFilesAdded([file]);
    },
    [handleFilesAdded]
  );

  const runConversionForItem = useCallback(
    async (item: QueuedFile) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.localId === item.localId
            ? { ...f, status: 'uploading', progress: 5, error: undefined }
            : f
        )
      );

      try {
        const result = await convertImageFile({
          file: item.file,
          targetFormat: item.targetFormat,
          settings,
          onProgress: (percent, phase) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.localId === item.localId
                  ? { ...f, status: phase, progress: percent }
                  : f
              )
            );
          },
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.localId === item.localId
              ? { ...f, status: 'done', progress: 100, result }
              : f
          )
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Conversion failed.';
        setFiles((prev) =>
          prev.map((f) =>
            f.localId === item.localId
              ? { ...f, status: 'error', progress: 0, error: message }
              : f
          )
        );
      }
    },
    [settings]
  );

  const handleConvertSingle = useCallback(
    async (localId: string) => {
      const target = filesRef.current.find((f) => f.localId === localId);
      if (!target) return;
      await runConversionForItem(target);
    },
    [runConversionForItem]
  );

  const handleConvertAll = useCallback(async () => {
    const pending = filesRef.current.filter(
      (f) => f.status === 'ready' || f.status === 'error'
    );
    if (pending.length === 0) return;

    setIsBatchConverting(true);
    setBannerError('');
    try {
      const concurrency = 3;
      let idx = 0;
      const worker = async () => {
        while (idx < pending.length) {
          const current = pending[idx++];
          if (current) {
            await runConversionForItem(current);
          }
        }
      };
      await Promise.all(
        Array.from({ length: Math.min(concurrency, pending.length) }, () => worker())
      );
    } finally {
      setIsBatchConverting(false);
    }
  }, [runConversionForItem]);

  const handleDownloadAll = useCallback(async () => {
    const completedResults = filesRef.current
      .filter((f) => f.status === 'done' && f.result)
      .map((f) => f.result!);

    if (completedResults.length === 0) return;
    setIsDownloadingZip(true);
    setBannerError('');
    try {
      await downloadZipBundle(completedResults);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Unable to create ZIP archive.');
    } finally {
      setIsDownloadingZip(false);
    }
  }, []);

  const handleBatchFormatChange = (format: TargetFormat) => {
    setBatchFormat(format);
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'uploading' || f.status === 'converting'
          ? f
          : { ...f, targetFormat: format, status: 'ready', progress: 0, result: undefined }
      )
    );
  };

  const handleFileFormatChange = (localId: string, format: TargetFormat) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.localId === localId
          ? { ...f, targetFormat: format, status: 'ready', progress: 0, result: undefined }
          : f
      )
    );
  };

  const handleRemoveFile = (localId: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.localId === localId);
      if (target && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.localId !== localId);
    });
  };

  const handleClearAll = () => {
    files.forEach((f) => {
      if (f.previewUrl.startsWith('blob:')) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
    setBannerError('');
  };

  const handleAuthSuccess = (session: UserSession) => {
    setUser(session);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore storage errors
    }
  };

  const handleSignOut = () => {
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const renderMainContent = () => {
    if (currentPath === '/about-us') return <AboutPage />;
    if (currentPath === '/privacy-policy') return <PrivacyPolicyPage />;
    if (currentPath === '/terms-and-conditions') return <TermsPage />;
    if (currentPath === '/contact-us') return <ContactPage />;

    if (currentPath !== '/') {
      return (
        <div className="flex-1 max-w-[780px] mx-auto px-4 py-16 text-center">
          <h1 className="text-[28px] font-bold text-[#111827]">Page Not Found</h1>
          <p className="mt-2 text-sm text-[#4B5563]">
            The page you requested could not be found on Free JPEG Converter.
          </p>
          <a
            href="/"
            className="mt-5 inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-sm font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px]"
          >
            Back to Free JPEG Converter
          </a>
        </div>
      );
    }

    return (
      <>
        {/* Hidden input for "Add More Images" inside Queue */}
        <input
          ref={addMoreInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/heic,image/heif,image/webp,image/avif,image/gif,image/bmp,image/tiff,.jpg,.jpeg,.png,.heic,.heif,.webp,.avif,.gif,.bmp,.tiff"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFilesAdded(Array.from(e.target.files));
              e.target.value = '';
            }
          }}
          className="hidden"
        />

        {/* Breadcrumb Trail */}
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-3.5 pb-1">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12.5px] sm:text-[13px]">
            <a href="/" className="text-[#047857] hover:underline">
              Home
            </a>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="text-[#047857] hover:underline cursor-pointer"
            >
              Image Tools
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
            <span className="text-[#6B7280]">{activePreset.breadcrumbLabel}</span>
          </nav>
        </div>

        {/* Hero Header */}
        <div className="max-w-[780px] mx-auto px-4 pt-5 sm:pt-6 pb-7 sm:pb-8 text-center">
          <h1 className="text-[27px] sm:text-[34px] md:text-[38px] font-bold tracking-[-0.025em] text-[#111827] leading-tight [text-wrap:balance]">
            {activePreset.title}
          </h1>
          <p className="mt-2.5 text-[14.5px] sm:text-[16px] text-[#4B5563] max-w-xl mx-auto [text-wrap:balance]">
            {activePreset.subtitle}
          </p>
          <nav
            aria-label="Site pages"
            className="mt-3.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[13px] font-medium text-[#4B5563]"
          >
            <a
              href="/about-us"
              className="text-[#047857] hover:text-[#065F46] hover:underline whitespace-nowrap"
            >
              About Us
            </a>
            <span aria-hidden="true" className="text-[#D1D5DB]">
              ·
            </span>
            <a
              href="/privacy-policy"
              className="text-[#047857] hover:text-[#065F46] hover:underline whitespace-nowrap"
            >
              Privacy Policy
            </a>
            <span aria-hidden="true" className="text-[#D1D5DB]">
              ·
            </span>
            <a
              href="/terms-and-conditions"
              className="text-[#047857] hover:text-[#065F46] hover:underline whitespace-nowrap"
            >
              Terms and Conditions
            </a>
            <span aria-hidden="true" className="text-[#D1D5DB]">
              ·
            </span>
            <a
              href="/contact-us"
              className="text-[#047857] hover:text-[#065F46] hover:underline whitespace-nowrap"
            >
              Contact Us
            </a>
          </nav>
        </div>

        {/* Error Toast Banner */}
        {bannerError && (
          <div className="max-w-[780px] mx-auto px-4 mb-4">
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs font-medium px-4 py-2.5 rounded-[4px] flex items-center justify-between gap-3">
              <span>{bannerError}</span>
              <button
                type="button"
                onClick={() => setBannerError('')}
                className="text-[#B91C1C] underline cursor-pointer shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Dashed Dropzone Card */}
        <Dropzone
          compact={files.length > 0}
          onFilesAdded={handleFilesAdded}
          onLoadSamples={handleLoadSamples}
          onAddFromUrl={handleAddFromUrl}
          onOpenSignUp={() => setAuthModalMode('signup')}
          onOpenTerms={() => setTermsOpen(true)}
        />

        {/* Interactive File Queue */}
        {files.length > 0 && (
          <FileQueue
            files={files}
            batchFormat={batchFormat}
            settings={settings}
            settingsOpen={settingsOpen}
            isBatchConverting={isBatchConverting}
            isDownloadingZip={isDownloadingZip}
            onToggleSettings={() => setSettingsOpen((prev) => !prev)}
            onUpdateSettings={(next) => {
              setSettings((prev) => ({ ...prev, ...next }));
              setFiles((prev) =>
                prev.map((f) =>
                  f.status === 'done'
                    ? { ...f, status: 'ready', progress: 0, result: undefined }
                    : f
                )
              );
            }}
            onBatchFormatChange={handleBatchFormatChange}
            onFileFormatChange={handleFileFormatChange}
            onConvertSingle={handleConvertSingle}
            onConvertAll={handleConvertAll}
            onDownloadAll={handleDownloadAll}
            onRemoveFile={handleRemoveFile}
            onClearAll={handleClearAll}
            onCompareFile={(item) => setCompareTarget(item)}
            onAddMoreClick={() => addMoreInputRef.current?.click()}
          />
        )}

        {/* Original SEO Content Section: 3-Step Guide, Why Convert to JPEG Feature Grid & FAQ */}
        <SeoSection onSelectPreset={handleSelectPreset} />
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827]">
      <Navbar
        currentPath={currentPath}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        onOpenPricing={() => setPricingOpen(true)}
        onOpenApi={() => setApiOpen(true)}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 flex flex-col">{renderMainContent()}</main>

      {/* Structured MPA SEO Footer */}
      <footer className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 border-b border-[#E5E7EB]">
            <div>
              <a href="/" className="text-[15.5px] font-bold text-[#111827]">
                Free JPEG Converter
              </a>
              <p className="mt-2 text-[13px] text-[#4B5563] leading-relaxed max-w-xs">
                Fast, browser-friendly JPEG image converter for desktop, Android, and iPhone—with
                batch processing and privacy-first ephemeral memory handling.
              </p>
            </div>

            <div>
              <h2 className="text-[13px] font-bold text-[#111827]">Image Converters</h2>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-[#4B5563]">
                <li>
                  <a href="/" className="hover:text-[#047857] hover:underline">
                    Free JPEG Converter
                  </a>
                </li>
                <li>
                  <a href="/?tool=jpeg-to-jpg" className="hover:text-[#047857] hover:underline">
                    JPEG to JPG Converter
                  </a>
                </li>
                <li>
                  <a href="/?tool=jpg-to-jpeg" className="hover:text-[#047857] hover:underline">
                    JPG to JPEG Format Converter
                  </a>
                </li>
                <li>
                  <a href="/?tool=png-to-jpeg" className="hover:text-[#047857] hover:underline">
                    Convert PNG to JPEG
                  </a>
                </li>
                <li>
                  <a href="/?tool=heic-to-jpeg" className="hover:text-[#047857] hover:underline">
                    Convert HEIC to JPEG
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[13px] font-bold text-[#111827]">Company &amp; Legal</h2>
              <ul className="mt-2.5 space-y-1.5 text-[13px] text-[#4B5563]">
                <li>
                  <a href="/about-us" className="hover:text-[#047857] hover:underline">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="hover:text-[#047857] hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms-and-conditions" className="hover:text-[#047857] hover:underline">
                    Terms and Conditions
                  </a>
                </li>
                <li>
                  <a href="/contact-us" className="hover:text-[#047857] hover:underline">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-5 flex flex-wrap items-center justify-between gap-4 text-[12.5px] text-[#6B7280]">
            <span>© {new Date().getFullYear()} Free JPEG Converter. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-4">
              <a href="/about-us" className="hover:text-[#047857]">
                About
              </a>
              <a href="/privacy-policy" className="hover:text-[#047857]">
                Privacy Policy
              </a>
              <a href="/terms-and-conditions" className="hover:text-[#047857]">
                Terms &amp; Conditions
              </a>
              <a href="/contact-us" className="hover:text-[#047857]">
                Contact Us
              </a>
              <a href="/sitemap.xml" className="hover:text-[#047857]">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {compareTarget && (
        <CompareModal file={compareTarget} onClose={() => setCompareTarget(null)} />
      )}
      {searchOpen && (
        <SearchModal
          onSelectPreset={handleSelectPreset}
          onClose={() => setSearchOpen(false)}
        />
      )}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onSuccess={handleAuthSuccess}
          onClose={() => setAuthModalMode(null)}
        />
      )}
      {pricingOpen && (
        <PricingModal
          onSignUp={() => setAuthModalMode('signup')}
          onClose={() => setPricingOpen(false)}
        />
      )}
      {apiOpen && <ApiModal onClose={() => setApiOpen(false)} />}
      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} />}
    </div>
  );
}
