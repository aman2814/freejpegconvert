import React, { useEffect, useState } from 'react';
import { Check, Download, Search, X } from 'lucide-react';
import { QueuedFile, UserSession } from '../types/converter';
import { CONVERTER_PRESETS, formatBytes, formatSavings } from '../utils/formatters';

interface ModalShellProps {
  title: string;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  onClose,
  maxWidth = 'max-w-lg',
  children,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#111827]/45 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] flex flex-col bg-white rounded-[6px] border border-[#E5E7EB] shadow-[0_20px_50px_rgba(16,24,40,0.18)] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-4 shrink-0">
          <h2 className="text-[16px] sm:text-[16.5px] font-bold text-[#111827] truncate">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 flex items-center justify-center text-[#6B7280] hover:text-[#111827] rounded-[4px] cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const CompareModal: React.FC<{
  file: QueuedFile;
  onClose: () => void;
}> = ({ file, onClose }) => {
  if (!file.result) return null;
  const savings = formatSavings(file.originalSize, file.result.convertedSize);

  return (
    <ModalShell title={`Quality Preview: ${file.result.fileName}`} onClose={onClose} maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-[#E5E7EB] rounded-[4px] overflow-hidden bg-[#F9FAFB]">
          <div className="px-3 py-2 border-b border-[#E5E7EB] bg-white flex items-center justify-between text-xs">
            <span className="font-semibold text-[#111827]">Source ({file.originalFormat})</span>
            <span className="font-mono tabular-nums text-[#6B7280]">
              {formatBytes(file.originalSize)}
            </span>
          </div>
          <div className="h-44 sm:h-64 flex items-center justify-center p-3">
            <img
              src={file.previewUrl}
              alt={`Source ${file.name}`}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>

        <div className="border border-[#E5E7EB] rounded-[4px] overflow-hidden bg-[#F9FAFB]">
          <div className="px-3 py-2 border-b border-[#E5E7EB] bg-white flex items-center justify-between text-xs">
            <span className="font-semibold text-[#047857]">
              Output ({file.result.targetFormat.toUpperCase()})
            </span>
            <span className="font-mono tabular-nums text-[#111827]">
              {formatBytes(file.result.convertedSize)}{' '}
              <span className={savings.isSmaller ? 'text-[#047857]' : 'text-[#6B7280]'}>
                ({savings.label})
              </span>
            </span>
          </div>
          <div className="h-44 sm:h-64 flex items-center justify-center p-3">
            <img
              src={file.result.previewUrl}
              alt={`Converted ${file.result.fileName}`}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[#6B7280] font-mono tabular-nums">
          Dimensions: {file.result.width} × {file.result.height} px
        </span>
        <a
          href={file.result.downloadUrl}
          download={file.result.fileName}
          className="px-4 py-2 text-sm font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px] flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Save {file.result.fileName}</span>
        </a>
      </div>
    </ModalShell>
  );
};

export const SearchModal: React.FC<{
  onSelectPreset: (id: string) => void;
  onClose: () => void;
}> = ({ onSelectPreset, onClose }) => {
  const [query, setQuery] = useState('');
  const presets = Object.values(CONVERTER_PRESETS).filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q);
  });

  return (
    <ModalShell title="Browse Image Tools" onClose={onClose} maxWidth="max-w-lg">
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a tool (e.g., JPEG, PNG, WEBP, Optimizer, Resizer)..."
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857]"
        />
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-[#F3F4F6]">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              onSelectPreset(preset.id);
              onClose();
            }}
            className="w-full text-left py-2.5 px-2 hover:bg-[#ECFDF5] rounded-[4px] cursor-pointer"
          >
            <div className="text-sm font-semibold text-[#111827]">{preset.title}</div>
            <div className="text-xs text-[#6B7280]">{preset.subtitle}</div>
          </button>
        ))}
        {presets.length === 0 && (
          <p className="py-6 text-center text-sm text-[#6B7280]">
            No matching image tool found.
          </p>
        )}
      </div>
    </ModalShell>
  );
};

export const AuthModal: React.FC<{
  initialMode: 'login' | 'signup';
  onSuccess: (user: UserSession) => void;
  onClose: () => void;
}> = ({ initialMode, onSuccess, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName =
      mode === 'signup' && name.trim()
        ? name.trim()
        : email.split('@')[0] || 'Member';
    onSuccess({ name: displayName, email: email.trim() });
    onClose();
  };

  return (
    <ModalShell
      title={mode === 'login' ? 'Sign In to Free JPEG Converter' : 'Create Free JPEG Converter Account'}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jamie Taylor"
              className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857]"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857]"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2.5 text-sm font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px] transition-colors cursor-pointer"
        >
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-4 pt-3 border-t border-[#E5E7EB] text-center text-xs text-[#6B7280]">
        {mode === 'login' ? (
          <>
            New here?{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-[#047857] font-semibold hover:underline cursor-pointer"
            >
              Create a free account
            </button>
          </>
        ) : (
          <>
            Already registered?{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-[#047857] font-semibold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </ModalShell>
  );
};

export const PricingModal: React.FC<{
  onSignUp: () => void;
  onClose: () => void;
}> = ({ onSignUp, onClose }) => (
  <ModalShell title="Conversion Plans & Limits" onClose={onClose} maxWidth="max-w-2xl">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="border border-[#E5E7EB] rounded-[6px] p-4 flex flex-col justify-between">
        <div>
          <div className="text-sm font-bold text-[#111827]">Standard Free</div>
          <div className="mt-1 text-2xl font-bold text-[#111827] tabular-nums">
            $0 <span className="text-xs font-normal text-[#6B7280]">/ forever</span>
          </div>
          <ul className="mt-4 space-y-2 text-xs text-[#4B5563]">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#047857]" />
              <span>Up to 1GB per uploaded image</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#047857]" />
              <span>JPEG, PNG, WEBP, AVIF, GIF & TIFF support</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#047857]" />
              <span>One-click ZIP bundle downloads</span>
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2 text-xs font-semibold text-[#111827] border border-[#D1D5DB] hover:bg-[#F9FAFB] rounded-[4px] cursor-pointer"
        >
          Active Plan
        </button>
      </div>

      <div className="border border-[#10B981] bg-[#ECFDF5]/60 rounded-[6px] p-4 flex flex-col justify-between">
        <div>
          <div className="text-sm font-bold text-[#047857]">Creator & Studio</div>
          <div className="mt-1 text-2xl font-bold text-[#111827] tabular-nums">
            $9 <span className="text-xs font-normal text-[#6B7280]">/ month</span>
          </div>
          <ul className="mt-4 space-y-2 text-xs text-[#4B5563]">
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#047857]" />
              <span>Expanded 5GB batch & high-res photo limit</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#047857]" />
              <span>Dedicated parallel worker queue</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#047857]" />
              <span>Automated REST API integration keys</span>
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            onSignUp();
          }}
          className="mt-5 w-full py-2 text-xs font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px] cursor-pointer"
        >
          Get Free Account
        </button>
      </div>
    </div>
  </ModalShell>
);

export const ApiModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalShell title="Conversion REST Endpoint" onClose={onClose} maxWidth="max-w-xl">
    <p className="text-xs text-[#4B5563] leading-relaxed">
      Automate image conversions from scripts or CI workflows using the built-in{' '}
      <code className="font-mono text-[#047857]">POST /api/convert</code> endpoint.
    </p>
    <pre className="mt-3 p-3.5 bg-[#111827] text-[#E5E7EB] text-xs font-mono rounded-[4px] overflow-x-auto leading-relaxed">
{`curl -X POST ${window.location.origin}/api/convert \\
  -F "file=@photo.png" \\
  -F "targetFormat=jpeg" \\
  -F "quality=88"`}
    </pre>
    <div className="mt-4 flex justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-1.5 text-xs font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px] cursor-pointer"
      >
        Close
      </button>
    </div>
  </ModalShell>
);

export const TermsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalShell title="Privacy & Usage Terms" onClose={onClose} maxWidth="max-w-lg">
    <div className="space-y-3 text-xs text-[#4B5563] leading-relaxed">
      <p>
        Images sent to Free JPEG Converter are processed solely to fulfill your chosen output
        format, quality, and resize options.
      </p>
      <p>
        Converted files remain in temporary memory only long enough for immediate download and are
        automatically cleared after 30 minutes. You retain complete ownership of every uploaded and
        exported image.
      </p>
    </div>
    <div className="mt-4 flex justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-1.5 text-xs font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px] cursor-pointer"
      >
        Got It
      </button>
    </div>
  </ModalShell>
);
