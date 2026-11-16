import React from 'react';
import { ArrowRight, ChevronRight, Gauge, ShieldCheck, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 bg-white">
      {/* Breadcrumb */}
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-3.5 pb-1">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12.5px] sm:text-[13px]">
          <a href="/" className="text-[#047857] hover:underline">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
          <span className="text-[#6B7280]">About Us</span>
        </nav>
      </div>

      {/* Main Content */}
      <article className="max-w-[860px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        <header className="pb-8 border-b border-[#E5E7EB]">
          <h1 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.025em] text-[#111827] leading-tight">
            About Free JPEG Converter
          </h1>
          <p className="mt-3 text-[15.5px] sm:text-[16.5px] text-[#4B5563] leading-relaxed max-w-2xl">
            We built Free JPEG Converter to make everyday image conversion fast, private, and
            dependable across smartphones, tablets, and desktop browsers—with zero software
            installs.
          </p>
        </header>

        <div className="mt-8 space-y-10 text-[14.5px] sm:text-[15px] text-[#374151] leading-relaxed">
          <section aria-labelledby="mission-heading">
            <h2 id="mission-heading" className="text-[20px] font-bold text-[#111827]">
              Our Mission
            </h2>
            <p className="mt-2.5">
              Modern cameras, design tools, and browsers output dozens of incompatible image
              formats—from Apple HEIC photos and transparent PNGs to WEBP and AVIF web assets. Yet
              email clients, school portals, job applications, and government upload forms still rely
              on universal <strong>.jpg</strong> and <strong>.jpeg</strong> files.
            </p>
            <p className="mt-3">
              Free JPEG Converter bridges that gap in seconds. Whether you need to convert a single
              iPhone snapshot on mobile, shrink a photo under 50 KB for an exam form, or batch
              convert dozens of design assets into a single ZIP bundle, our tool keeps the workflow
              clean and clutter-free.
            </p>
          </section>

          <section aria-labelledby="engine-heading" className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] p-5">
              <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center">
                <Gauge className="w-4.5 h-4.5" aria-hidden="true" />
              </div>
              <h3 className="mt-3.5 text-[15.5px] font-bold text-[#111827]">
                MozJPEG Precision
              </h3>
              <p className="mt-1.5 text-[13.5px] text-[#4B5563]">
                Server-side Sharp &amp; MozJPEG pipelines preserve sharp edges while achieving
                high compression ratios and optional KB size limits.
              </p>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] p-5">
              <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center">
                <ShieldCheck className="w-4.5 h-4.5" aria-hidden="true" />
              </div>
              <h3 className="mt-3.5 text-[15.5px] font-bold text-[#111827]">
                Ephemeral Memory
              </h3>
              <p className="mt-1.5 text-[13.5px] text-[#4B5563]">
                Files are converted in temporary memory only and automatically purged within 30
                minutes, with optional EXIF and GPS tag stripping.
              </p>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] p-5">
              <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center">
                <Sparkles className="w-4.5 h-4.5" aria-hidden="true" />
              </div>
              <h3 className="mt-3.5 text-[15.5px] font-bold text-[#111827]">
                Built for Every Screen
              </h3>
              <p className="mt-1.5 text-[13.5px] text-[#4B5563]">
                Designed to work identically on Android Chrome, iPhone Safari, tablets, and wide
                desktop workstations.
              </p>
            </div>
          </section>

          <section aria-labelledby="supported-heading">
            <h2 id="supported-heading" className="text-[20px] font-bold text-[#111827]">
              Supported Formats &amp; Tools
            </h2>
            <p className="mt-2.5">
              Our online converter accepts <strong>PNG, HEIC, HEIF, WEBP, AVIF, GIF, TIFF, BMP,
              JPG, and JPEG</strong> files. You can convert between <code>.jpg</code> and{' '}
              <code>.jpeg</code> extensions, flatten transparent graphics onto custom background
              colors, cap maximum pixel dimensions, and preview before-and-after results side by
              side.
            </p>
          </section>

          <section className="pt-6 border-t border-[#E5E7EB] flex flex-wrap items-center gap-3">
            <a
              href="/"
              className="min-h-[44px] px-5 py-2.5 text-[14px] font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px] inline-flex items-center gap-2 transition-colors"
            >
              <span>Open JPEG Converter</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/contact-us"
              className="min-h-[44px] px-5 py-2.5 text-[14px] font-medium text-[#374151] bg-white border border-[#D1D5DB] hover:bg-[#F9FAFB] rounded-[4px] inline-flex items-center transition-colors"
            >
              Contact Our Team
            </a>
          </section>
        </div>
      </article>
    </div>
  );
};
