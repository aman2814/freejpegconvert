import React from 'react';
import { ChevronRight } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="flex-1 bg-white">
      {/* Breadcrumb */}
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-3.5 pb-1">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12.5px] sm:text-[13px]">
          <a href="/" className="text-[#047857] hover:underline">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
          <span className="text-[#6B7280]">Terms and Conditions</span>
        </nav>
      </div>

      {/* Main Content */}
      <article className="max-w-[860px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        <header className="pb-8 border-b border-[#E5E7EB]">
          <h1 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.025em] text-[#111827] leading-tight">
            Terms and Conditions
          </h1>
          <p className="mt-2.5 text-[13.5px] text-[#6B7280] tabular-nums">
            Last updated: November 15, 2026
          </p>
        </header>

        <div className="mt-8 space-y-8 text-[14.5px] sm:text-[15px] text-[#374151] leading-relaxed">
          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2">
              By accessing or using Free JPEG Converter, you agree to be bound by these Terms and
              Conditions and our{' '}
              <a href="/privacy-policy" className="text-[#047857] font-medium hover:underline">
                Privacy Policy
              </a>
              . If you do not agree with these terms, please discontinue use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              2. Ownership &amp; Intellectual Property
            </h2>
            <p className="mt-2">
              You retain 100% ownership, copyright, and intellectual property rights over all
              images you upload and all converted files you download. Free JPEG Converter claims no
              license or ownership interest in your media.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              3. Acceptable Use &amp; User Responsibilities
            </h2>
            <p className="mt-2">
              By uploading or importing an image URL, you represent that you own the rights to that
              file or have permission from the rights holder. You agree not to:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1.5 text-[#4B5563]">
              <li>
                Upload unlawful, infringing, defamatory, or malicious payloads disguised as image
                files.
              </li>
              <li>
                Attempt to disrupt, overload, or bypass rate and size limits on the conversion
                server.
              </li>
              <li>
                Use automated scraping scripts that interfere with normal service availability for
                other users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              4. Service Availability &amp; Processing Limits
            </h2>
            <p className="mt-2">
              Free JPEG Converter is provided free of charge for personal and commercial image
              format conversion. Converted files are held in temporary memory for up to 30 minutes
              before automatic deletion; please download your converted images or ZIP archive
              promptly after conversion completes.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              5. Disclaimer of Warranties
            </h2>
            <p className="mt-2">
              The service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
              basis without warranties of any kind. Always keep backups of irreplaceable original
              photographs before applying lossy compression or resizing.
            </p>
          </section>

          <section>
            <h2 className="text-[19px] font-bold text-[#111827]">
              6. Changes &amp; Contact
            </h2>
            <p className="mt-2">
              We may revise these Terms and Conditions periodically to reflect new features or
              legal requirements. If you have questions regarding these terms, please{' '}
              <a href="/contact-us" className="text-[#047857] font-medium hover:underline">
                contact us
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  );
};
