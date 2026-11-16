import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  FileDown,
  FileText,
  Gauge,
  Globe,
  Info,
  Layers,
  Mail,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export const SEO_FAQS: FaqItem[] = [
  {
    question: 'How do I convert JPG to JPEG online?',
    answer:
      'Upload your .jpg image using the Select Image Files button or drag and drop it into our free JPEG converter. Ensure JPEG is chosen in the Output dropdown, click Convert, and download your standardized .jpeg file immediately.',
  },
  {
    question: 'How can I use this as a JPG to JPEG converter under 50 KB?',
    answer:
      'After adding your image, click Output Settings above the queue and enter 50 into the Max File Size (KB) field (or lower the Compression Quality slider). Our converter automatically optimizes MozJPEG encoding—and scales dimensions only if needed—so your output JPEG stays under 50 KB for exam, passport, or government upload forms.',
  },
  {
    question: 'How to convert a photo to JPEG in mobile for free?',
    answer:
      'Open Free JPEG Converter in any mobile browser (Chrome, Safari, Edge, or Firefox)—no app install or signup required. Tap Select Image Files, pick photos from your phone gallery, keep JPEG selected as the output format, tap Convert, and save the converted photo or ZIP file directly to your device.',
  },
  {
    question: 'How to convert a photo to JPEG on Android?',
    answer:
      'On Android, open this page in Chrome or your preferred browser and tap Select Image Files. Choose Files or Photo Picker, select your PNG, WEBP, or camera images, set the output format to JPEG, and tap Convert to download ready-to-share JPEG files straight to your Downloads folder.',
  },
  {
    question: 'How to convert a picture to JPEG on iPhone?',
    answer:
      'On an iPhone or iPad, tap Select Image Files in Safari and choose Photo Library or Browse from the Files app. Select your HEIC, PNG, or screenshot images, keep JPEG selected, tap Convert, and tap Download to save the converted JPEG to your iPhone Files or Photos.',
  },
  {
    question: 'How to convert HEIC to JPEG?',
    answer:
      'iPhone and iPad cameras often save photos in Apple HEIC format. Simply upload your .heic or .heif files directly into our converter, make sure JPEG (or JPG) is selected as the target format, and click Convert to convert HEIC to JPEG for full compatibility across Windows, Android, and web portals.',
  },
  {
    question: 'How do I convert PNG to JPEG without black transparent backgrounds?',
    answer:
      'Upload one or more PNG graphics, leave JPEG selected in the output dropdown, and click Convert. Because JPEG does not support alpha transparency, our converter automatically blends transparent areas onto a clean solid fill color (white by default, customizable in Output Settings) while reducing file size.',
  },
  {
    question: 'Can I convert a photo to JPEG format for free in batches?',
    answer:
      'Yes. You can upload and convert multiple photos to JPEG format for free at the same time—up to 1GB per image—track real-time conversion progress for each file, compare before-and-after previews, and download everything together in a single ZIP archive.',
  },
  {
    question: 'How to convert a PDF to JPEG?',
    answer:
      'Free JPEG Converter processes image files directly (PNG, HEIC, WEBP, AVIF, GIF, TIFF, and JPG). To convert a PDF page to JPEG, first export or save the PDF page as a PNG or screenshot on your phone or computer (using Preview on Mac, Print/Export to image, or your mobile screenshot tool), then drop that image into the upload box above to convert it to an optimized JPEG.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Upload Any Image Format',
    description:
      'Drag and drop PNG, HEIC, WEBP, AVIF, GIF, or JPG files into our free JPEG converter dropzone above, browse from your device, or import from a web URL.',
  },
  {
    number: '02',
    title: 'Pick JPEG or JPG & Quality',
    description:
      'Choose JPEG to convert to JPEG, or select JPG to convert JPEG to JPG format. Open Output Settings to adjust compression quality (10–100%), max pixel dimensions, or EXIF removal.',
  },
  {
    number: '03',
    title: 'Download Converted Photos',
    description:
      'Click Convert to run your image convert JPEG queue in seconds, compare source vs. output quality, and save individual files or export everything in one ZIP archive.',
  },
];

const FEATURES = [
  {
    icon: FileDown,
    title: 'Smaller File Sizes',
    description:
      'MozJPEG encoding turns oversized PNG screenshots and raw camera exports into compact JPEGs without visible loss, saving storage and email space.',
  },
  {
    icon: Globe,
    title: 'Universal Compatibility',
    description:
      'Whether you use our JPEG to JPG converter or JPG to JPEG format converter, .jpg and .jpeg files open natively on every browser, OS, and CMS.',
  },
  {
    icon: Gauge,
    title: 'Fast Web Loading',
    description:
      'Lightweight JPEG files accelerate page load speed, improve Core Web Vitals (LCP), and cut mobile bandwidth across blogs and online stores.',
  },
  {
    icon: SlidersHorizontal,
    title: 'HEIC & PNG Ready',
    description:
      'Quickly convert HEIC to JPEG from iPhone camera rolls or convert PNG to JPEG with automatic alpha-channel background flattening.',
  },
  {
    icon: Layers,
    title: 'JPEG to JPG Format Control',
    description:
      'Need an exact .jpg or .jpeg file extension for strict upload portals? Switch seamlessly with our JPEG converter to JPG and JPG to JPEG presets.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-First Processing',
    description:
      'Remove embedded EXIF and GPS tags in one click, with automatic in-memory cleanup 30 minutes after your conversion finishes.',
  },
];

const QUICK_CONVERTERS = [
  { id: 'jpeg', label: 'Free JPEG Converter' },
  { id: 'png-to-jpeg', label: 'Convert PNG to JPEG' },
  { id: 'heic-to-jpeg', label: 'Convert HEIC to JPEG' },
  { id: 'jpeg-to-jpg', label: 'JPEG to JPG Converter' },
  { id: 'jpg-to-jpeg', label: 'JPG to JPEG Format Converter' },
  { id: 'webp', label: 'WEBP to JPEG Converter' },
];

const SITE_PAGES = [
  {
    href: '/about-us',
    icon: Info,
    title: 'About Us',
    description:
      'Learn how Free JPEG Converter delivers MozJPEG compression, mobile-first conversion, and fast batch ZIP exports.',
    cta: 'Read About Us',
  },
  {
    href: '/privacy-policy',
    icon: ShieldCheck,
    title: 'Privacy Policy',
    description:
      'See how uploaded files are processed in ephemeral memory, automatically purged within 30 minutes, with EXIF/GPS removal.',
    cta: 'View Privacy Policy',
  },
  {
    href: '/terms-and-conditions',
    icon: FileText,
    title: 'Terms and Conditions',
    description:
      'Review user media ownership guarantees, acceptable use standards, and free personal or commercial usage terms.',
    cta: 'Read Terms & Conditions',
  },
  {
    href: '/contact-us',
    icon: Mail,
    title: 'Contact Us',
    description:
      'Get in touch for format requests, compression questions, bug reports, or privacy inquiries.',
    cta: 'Open Contact Page',
  },
];

interface SeoSectionProps {
  onSelectPreset: (presetId: string) => void;
}

export const SeoSection: React.FC<SeoSectionProps> = ({ onSelectPreset }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleQuickToolClick = (presetId: string) => {
    onSelectPreset(presetId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-[960px] mx-auto px-4 pt-12 sm:pt-14 pb-16 space-y-14 sm:space-y-16">
      {/* 1. How to Convert Images to JPEG (3-Step Guide) */}
      <section aria-labelledby="how-to-heading" className="pt-10 border-t border-[#E5E7EB]">
        <div className="max-w-2xl">
          <h2
            id="how-to-heading"
            className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] text-[#111827]"
          >
            How to Convert Images to JPEG
          </h2>
          <p className="mt-2 text-[14.5px] sm:text-[15px] text-[#4B5563] leading-relaxed">
            Use this online JPEG image converter to convert to JPEG or convert image JPEG to JPG
            format in three quick steps.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 flex flex-col"
            >
              <span className="font-mono text-[13px] font-medium text-[#047857] tabular-nums">
                Step {step.number}
              </span>
              <h3 className="mt-2 text-[16px] font-bold text-[#111827]">{step.title}</h3>
              <p className="mt-2 text-[13.5px] text-[#4B5563] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Why Convert to JPEG? Feature Grid */}
      <section aria-labelledby="why-jpeg-heading" className="pt-10 border-t border-[#E5E7EB]">
        <div className="max-w-2xl">
          <h2
            id="why-jpeg-heading"
            className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] text-[#111827]"
          >
            Why Convert to JPEG?
          </h2>
          <p className="mt-2 text-[14.5px] sm:text-[15px] text-[#4B5563] leading-relaxed">
            Designed as an everyday JPEG converter for photographers, designers, and teams who need
            fast image convert JPEG workflows without desktop software.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] p-5"
              >
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                </div>
                <h3 className="mt-3.5 text-[15.5px] font-bold text-[#111827]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] text-[#4B5563] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Dedicated On-Page Converter Shortcuts */}
        <div className="mt-8 pt-6 border-t border-[#F3F4F6]">
          <h3 className="text-[14px] font-bold text-[#111827]">
            Popular JPEG &amp; JPG Conversion Presets
          </h3>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {QUICK_CONVERTERS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleQuickToolClick(tool.id)}
                className="min-h-[44px] px-4 py-2.5 text-left text-[13.5px] font-medium text-[#111827] bg-white border border-[#E5E7EB] hover:border-[#6EE7B7] hover:bg-[#ECFDF5] hover:text-[#047857] rounded-[6px] flex items-center justify-between gap-2 transition-colors cursor-pointer"
              >
                <span>{tool.label}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[#047857]" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Frequently Asked Questions */}
      <section aria-labelledby="faq-heading" className="pt-10 border-t border-[#E5E7EB]">
        <div className="max-w-2xl">
          <h2
            id="faq-heading"
            className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] text-[#111827]"
          >
            JPEG Converter Frequently Asked Questions
          </h2>
          <p className="mt-2 text-[14.5px] sm:text-[15px] text-[#4B5563] leading-relaxed">
            Everything you need to know to convert PNG to JPEG, convert HEIC to JPEG, or convert
            JPEG to JPG format cleanly.
          </p>
        </div>

        <div className="mt-6 border border-[#E5E7EB] rounded-[6px] bg-white divide-y divide-[#E5E7EB]">
          {SEO_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                >
                  <span className="text-[14.5px] sm:text-[15px] font-semibold text-[#111827]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#6B7280] shrink-0 transition-transform duration-150 ${
                      isOpen ? 'rotate-180 text-[#047857]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-[13.5px] sm:text-[14px] text-[#4B5563] leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Site Information, Legal & Support Pages */}
      <section aria-labelledby="site-pages-heading" className="pt-10 border-t border-[#E5E7EB]">
        <div className="max-w-2xl">
          <h2
            id="site-pages-heading"
            className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] text-[#111827]"
          >
            Company, Privacy &amp; Support Pages
          </h2>
          <p className="mt-2 text-[14.5px] sm:text-[15px] text-[#4B5563] leading-relaxed">
            Explore full details about how Free JPEG Converter works, how your photos stay private,
            and how to contact our team.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {SITE_PAGES.map((page) => {
            const Icon = page.icon;
            return (
              <a
                key={page.href}
                href={page.href}
                className="group bg-white border border-[#E5E7EB] hover:border-[#6EE7B7] hover:bg-[#ECFDF5]/40 rounded-[6px] p-5 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-3.5 text-[15.5px] font-bold text-[#111827] group-hover:text-[#047857] transition-colors">
                    {page.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-[#4B5563] leading-relaxed">
                    {page.description}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#047857]">
                  <span>{page.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
};
