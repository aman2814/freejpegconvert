import React from 'react';
import { ChevronRight } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="flex-1 bg-white">
      {/* Breadcrumb */}
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-3.5 pb-1">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12.5px] sm:text-[13px]">
          <a href="/" className="text-[#047857] hover:underline">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
          <span className="text-[#6B7280]">Privacy Policy</span>
        </nav>
      </div>

      {/* Main Content */}
      <article className="max-w-[860px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        <header className="pb-8 border-b border-[#E5E7EB]">
          <h1 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.025em] text-[#111827] leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-2.5 text-[13.5px] text-[#6B7280] tabular-nums">
            Last updated: November 15, 2026
          </p>
        </header>

        <div className="mt-8 space-y-8 text-[14.5px] sm:text-[15px] text-[#374151] leading-relaxed">
          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              1. Overview &amp; Commitment to File Privacy
            </h2>
            <p className="mt-2">
              Free JPEG Converter (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the
              Service&rdquo;) respects your privacy. This Privacy Policy explains how uploaded
              images, technical preferences, and contact inquiries are handled when you visit our
              website and use our image conversion tools.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              2. Uploaded Images &amp; Temporary Memory Retention
            </h2>
            <p className="mt-2">
              Images you upload for conversion (such as PNG, HEIC, WEBP, AVIF, GIF, TIFF, or JPG
              files) are processed strictly in ephemeral server memory to generate the requested
              output format and size.
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5 text-[#4B5563]">
              <li>
                We do not sell, publish, or use your uploaded photographs or graphics to train
                machine learning models.
              </li>
              <li>
                Converted outputs remain in temporary memory only to support your individual
                download, preview comparison, or ZIP bundle export, and are automatically purged
                within 30 minutes.
              </li>
              <li>
                You can remove any file from your active queue at any time using the Clear Queue or
                remove buttons.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              3. Camera EXIF &amp; Location Metadata
            </h2>
            <p className="mt-2">
              Photos captured on smartphones and digital cameras often contain embedded EXIF tags,
              including device model, capture timestamps, and GPS coordinates. By default, Free
              JPEG Converter strips EXIF and location metadata during conversion unless you uncheck
              this option in Output Settings.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              4. Remote URL Imports
            </h2>
            <p className="mt-2">
              When you choose <em>Import from Web URL</em>, our server fetches only the specific
              image URL you submit so it can be added to your conversion queue. Only standard
              HTTP/HTTPS image responses are accepted.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              5. Browser Storage &amp; Account Preferences
            </h2>
            <p className="mt-2">
              If you sign in or create a local profile on Free JPEG Converter, your display name and
              email preference are stored locally in your browser&rsquo;s <code>localStorage</code>{' '}
              and can be cleared at any time by signing out or clearing site data.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              6. Contact Form Data
            </h2>
            <p className="mt-2">
              When you submit a message through our{' '}
              <a href="/contact-us" className="text-[#047857] font-medium hover:underline">
                Contact Us
              </a>{' '}
              page, we collect your name, email address, topic, and message solely to respond to
              your support request or feedback.
            </p>
          </section>

          <section className="pt-6 border-t border-[#E5E7EB]">
            <p className="text-[14px] text-[#4B5563]">
              Questions about this Privacy Policy? Reach out through our{' '}
              <a href="/contact-us" className="text-[#047857] font-medium hover:underline">
                Contact Us page
              </a>{' '}
              or review our{' '}
              <a
                href="/terms-and-conditions"
                className="text-[#047857] font-medium hover:underline"
              >
                Terms and Conditions
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  );
};
