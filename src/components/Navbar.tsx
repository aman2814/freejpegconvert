import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import { UserSession } from '../types/converter';

interface NavbarProps {
  currentPath: string;
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenSearch: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenPricing: () => void;
  onOpenApi: () => void;
  user: UserSession | null;
  onSignOut: () => void;
}

type DropdownKey = 'convert' | 'compress' | 'tools' | 'api' | 'legal' | null;

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  activePresetId,
  onSelectPreset,
  onOpenSearch,
  onOpenAuth,
  onOpenPricing,
  onOpenApi,
  user,
  onSignOut,
}) => {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handlePresetClick = (presetId: string) => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    if (currentPath !== '/') {
      window.location.assign(presetId === 'jpeg' ? '/' : `/?tool=${encodeURIComponent(presetId)}`);
      return;
    }
    onSelectPreset(presetId);
  };

  return (
    <header
      ref={navRef}
      className="relative z-40 w-full bg-white border-b border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Custom Brand Mark + Navigation Links */}
        <div className="flex items-center gap-4 lg:gap-5 xl:gap-7 min-w-0">
          <a
            href="/"
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#047857] rounded-md py-1"
          >
            {/* Unique custom SVG logo mark for Free JPEG Converter: rounded emerald frame with stylized photo landscape & sun */}
            <span className="w-7 h-7 rounded-[7px] bg-[#047857] flex items-center justify-center shadow-xs group-hover:bg-[#065F46] transition-colors shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="16"
                  rx="2.5"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle cx="8.5" cy="9.5" r="1.5" fill="#A7F3D0" />
                <path
                  d="M4.5 17.5L9.5 12.5L13 15.8L16.2 12.6L19.5 17.5H4.5Z"
                  fill="#FFFFFF"
                />
              </svg>
            </span>
            <span className="text-[16px] sm:text-[18.5px] font-bold tracking-[-0.02em] text-[#111827] whitespace-nowrap">
              Free JPEG Converter
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-3.5 xl:gap-5 text-[13.5px] font-medium text-[#374151]"
          >
            {/* Convert Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('convert')}
                className={`flex items-center gap-1 py-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-[#047857] ${
                  openDropdown === 'convert' ? 'text-[#047857]' : ''
                }`}
              >
                <span>Convert</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
              {openDropdown === 'convert' && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-white border border-[#E5E7EB] rounded-[6px] shadow-[0_12px_32px_rgba(16,24,40,0.1)] p-2 z-50">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#6B7280]">
                    Format Converters
                  </div>
                  {[
                    { id: 'jpeg', label: 'Free JPEG Converter', desc: 'Convert any image to JPEG online' },
                    { id: 'jpeg-to-jpg', label: 'JPEG to JPG Converter', desc: 'Convert JPEG to JPG format (.jpg)' },
                    { id: 'jpg-to-jpeg', label: 'JPG to JPEG Converter', desc: 'Convert JPG to JPEG format (.jpeg)' },
                    { id: 'png-to-jpeg', label: 'Convert PNG to JPEG', desc: 'Flatten & shrink PNGs to JPEG' },
                    { id: 'heic-to-jpeg', label: 'Convert HEIC to JPEG', desc: 'Convert iPhone HEIC photos to JPEG' },
                    { id: 'webp', label: 'WEBP Image Converter', desc: 'Save WEBP files as JPEG or PNG' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePresetClick(item.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-[4px] transition-colors cursor-pointer ${
                        currentPath === '/' && activePresetId === item.id
                          ? 'bg-[#ECFDF5] text-[#047857]'
                          : 'hover:bg-[#F3F4F6] text-[#111827]'
                      }`}
                    >
                      <div className="text-[13.5px] font-semibold">{item.label}</div>
                      <div className="text-[11.5px] text-[#6B7280]">{item.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Optimize Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('compress')}
                className={`flex items-center gap-1 py-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-[#047857] ${
                  openDropdown === 'compress' ? 'text-[#047857]' : ''
                }`}
              >
                <span>Optimize</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
              {openDropdown === 'compress' && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-[#E5E7EB] rounded-[6px] shadow-[0_12px_32px_rgba(16,24,40,0.1)] p-2 z-50">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#6B7280]">
                    Size Optimization
                  </div>
                  {[
                    { id: 'compress-jpeg', label: 'JPEG Size Optimizer', desc: 'Trim photo size with MozJPEG' },
                    { id: 'compress-png', label: 'PNG Size Optimizer', desc: 'Smart palette PNG reduction' },
                    { id: 'compress-webp', label: 'WEBP Size Optimizer', desc: 'Leaner WEBP web assets' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePresetClick(item.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-[4px] transition-colors cursor-pointer ${
                        currentPath === '/' && activePresetId === item.id
                          ? 'bg-[#ECFDF5] text-[#047857]'
                          : 'hover:bg-[#F3F4F6] text-[#111827]'
                      }`}
                    >
                      <div className="text-[13.5px] font-semibold">{item.label}</div>
                      <div className="text-[11.5px] text-[#6B7280]">{item.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('tools')}
                className={`flex items-center gap-1 py-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-[#047857] ${
                  openDropdown === 'tools' ? 'text-[#047857]' : ''
                }`}
              >
                <span>Tools</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
              {openDropdown === 'tools' && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-[#E5E7EB] rounded-[6px] shadow-[0_12px_32px_rgba(16,24,40,0.1)] p-2 z-50">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#6B7280]">
                    Photo Utilities
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePresetClick('resize')}
                    className="w-full text-left px-2.5 py-2 rounded-[4px] hover:bg-[#F3F4F6] text-[#111827] cursor-pointer"
                  >
                    <div className="text-[13.5px] font-semibold">Batch Image Resizer</div>
                    <div className="text-[11.5px] text-[#6B7280]">Cap output width &amp; height in px</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetClick('jpeg')}
                    className="w-full text-left px-2.5 py-2 rounded-[4px] hover:bg-[#F3F4F6] text-[#111827] cursor-pointer"
                  >
                    <div className="text-[13.5px] font-semibold">Bulk ZIP Exporter</div>
                    <div className="text-[11.5px] text-[#6B7280]">Convert &amp; bundle photos as ZIP</div>
                  </button>
                </div>
              )}
            </div>

            {/* API Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('api')}
                className={`flex items-center gap-1 py-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-[#047857] ${
                  openDropdown === 'api' ? 'text-[#047857]' : ''
                }`}
              >
                <span>API</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
              {openDropdown === 'api' && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-[#E5E7EB] rounded-[6px] shadow-[0_12px_32px_rgba(16,24,40,0.1)] p-2 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenDropdown(null);
                      onOpenApi();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-[4px] hover:bg-[#F3F4F6] text-[#111827] cursor-pointer"
                  >
                    <div className="text-[13.5px] font-semibold">Conversion REST Endpoint</div>
                    <div className="text-[11.5px] text-[#6B7280]">Integrate /api/convert in scripts</div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setOpenDropdown(null);
                onOpenPricing();
              }}
              className="py-2 whitespace-nowrap shrink-0 cursor-pointer hover:text-[#047857] transition-colors"
            >
              Plans
            </button>

            <a
              href="/about-us"
              className={`py-2 whitespace-nowrap shrink-0 transition-colors hover:text-[#047857] ${
                currentPath === '/about-us' ? 'text-[#047857] font-semibold' : ''
              }`}
            >
              About Us
            </a>

            <a
              href="/privacy-policy"
              className={`hidden xl:inline-block py-2 whitespace-nowrap shrink-0 transition-colors hover:text-[#047857] ${
                currentPath === '/privacy-policy' ? 'text-[#047857] font-semibold' : ''
              }`}
            >
              Privacy Policy
            </a>

            <a
              href="/terms-and-conditions"
              className={`hidden xl:inline-block py-2 whitespace-nowrap shrink-0 transition-colors hover:text-[#047857] ${
                currentPath === '/terms-and-conditions' ? 'text-[#047857] font-semibold' : ''
              }`}
            >
              Terms
            </a>

            <a
              href="/contact-us"
              className={`py-2 whitespace-nowrap shrink-0 transition-colors hover:text-[#047857] ${
                currentPath === '/contact-us' ? 'text-[#047857] font-semibold' : ''
              }`}
            >
              Contact Us
            </a>

            {/* Compact Legal Dropdown for lg screens (1024px–1279px) */}
            <div className="relative xl:hidden">
              <button
                type="button"
                onClick={() => toggleDropdown('legal')}
                className={`flex items-center gap-1 py-2 whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:text-[#047857] ${
                  openDropdown === 'legal' ||
                  currentPath === '/privacy-policy' ||
                  currentPath === '/terms-and-conditions'
                    ? 'text-[#047857]'
                    : ''
                }`}
              >
                <span>Legal</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>
              {openDropdown === 'legal' && (
                <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-[#E5E7EB] rounded-[6px] shadow-[0_12px_32px_rgba(16,24,40,0.1)] p-2 z-50">
                  <a
                    href="/privacy-policy"
                    className={`block px-2.5 py-2 rounded-[4px] text-[13.5px] font-medium ${
                      currentPath === '/privacy-policy'
                        ? 'bg-[#ECFDF5] text-[#047857]'
                        : 'text-[#111827] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/terms-and-conditions"
                    className={`block px-2.5 py-2 rounded-[4px] text-[13.5px] font-medium ${
                      currentPath === '/terms-and-conditions'
                        ? 'bg-[#ECFDF5] text-[#047857]'
                        : 'text-[#111827] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    Terms &amp; Conditions
                  </a>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Search + Sign In + Get Free Account */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search image tools"
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2]" />
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-[13.5px] font-medium text-[#374151] whitespace-nowrap">
                {user.name}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="px-3.5 py-1.5 text-[13.5px] font-medium text-[#047857] border border-[#6EE7B7] hover:bg-[#ECFDF5] rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-2.5 py-1.5 text-[14px] font-medium text-[#374151] hover:text-[#047857] transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="px-3.5 py-1.5 text-[14px] font-semibold text-[#047857] border border-[#10B981] hover:bg-[#ECFDF5] rounded-[4px] transition-colors whitespace-nowrap cursor-pointer"
              >
                Get Free Account
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="lg:hidden w-10 h-10 rounded-[4px] border border-[#E5E7EB] flex items-center justify-center text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile & Tablet Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-white px-4 py-4 space-y-4 shadow-[0_12px_28px_rgba(16,24,40,0.08)]">
          <div>
            <div className="text-[11px] font-semibold text-[#6B7280] mb-2">
              Format Converters
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'jpeg', label: 'Free JPEG Converter' },
                { id: 'jpeg-to-jpg', label: 'JPEG to JPG' },
                { id: 'jpg-to-jpeg', label: 'JPG to JPEG' },
                { id: 'png-to-jpeg', label: 'PNG to JPEG' },
                { id: 'heic-to-jpeg', label: 'HEIC to JPEG' },
                { id: 'webp', label: 'WEBP to JPEG' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePresetClick(item.id)}
                  className={`text-left px-3 min-h-[44px] text-[13.5px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                    currentPath === '/' && activePresetId === item.id
                      ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#047857]'
                      : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#111827] hover:bg-[#ECFDF5]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-[#6B7280] mb-2">
              Pages &amp; Legal
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href="/about-us"
                className={`px-3 min-h-[44px] text-[13.5px] font-medium rounded-[4px] border flex items-center ${
                  currentPath === '/about-us'
                    ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#047857]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]'
                }`}
              >
                About Us
              </a>
              <a
                href="/privacy-policy"
                className={`px-3 min-h-[44px] text-[13.5px] font-medium rounded-[4px] border flex items-center ${
                  currentPath === '/privacy-policy'
                    ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#047857]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]'
                }`}
              >
                Privacy Policy
              </a>
              <a
                href="/terms-and-conditions"
                className={`px-3 min-h-[44px] text-[13.5px] font-medium rounded-[4px] border flex items-center ${
                  currentPath === '/terms-and-conditions'
                    ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#047857]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]'
                }`}
              >
                Terms &amp; Conditions
              </a>
              <a
                href="/contact-us"
                className={`px-3 min-h-[44px] text-[13.5px] font-medium rounded-[4px] border flex items-center ${
                  currentPath === '/contact-us'
                    ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#047857]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]'
                }`}
              >
                Contact Us
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignOut();
                }}
                className="w-full min-h-[44px] px-4 text-sm font-medium text-[#047857] border border-[#10B981] rounded-[4px] cursor-pointer"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex-1 min-h-[44px] px-4 text-sm font-medium text-[#374151] border border-[#E5E7EB] rounded-[4px] cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="flex-1 min-h-[44px] px-4 text-sm font-semibold text-white bg-[#047857] hover:bg-[#065F46] rounded-[4px] cursor-pointer"
                >
                  Get Free Account
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
