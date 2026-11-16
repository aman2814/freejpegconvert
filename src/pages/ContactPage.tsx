import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Clock, Loader2, Mail, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General Support');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Unable to send your message right now.');
      }
      setTicketId(data.ticketId || 'FJC-RECEIVED');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send your message right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-white">
      {/* Breadcrumb */}
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-3.5 pb-1">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12.5px] sm:text-[13px]">
          <a href="/" className="text-[#047857] hover:underline">
            Home
          </a>
          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" aria-hidden="true" />
          <span className="text-[#6B7280]">Contact Us</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        <header className="pb-8 border-b border-[#E5E7EB]">
          <h1 className="text-[28px] sm:text-[36px] font-bold tracking-[-0.025em] text-[#111827] leading-tight">
            Contact Us
          </h1>
          <p className="mt-2.5 text-[15px] sm:text-[16px] text-[#4B5563] max-w-2xl leading-relaxed">
            Have a question about converting HEIC, PNG, or JPG files, reporting an issue, or
            requesting a new format? Send us a note below.
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-8 items-start">
          {/* Contact Form */}
          <div className="bg-white border border-[#E5E7EB] rounded-[6px] p-5 sm:p-6">
            {ticketId ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-11 h-11 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-[18px] font-bold text-[#111827]">
                  Message Received
                </h2>
                <p className="text-[13.5px] text-[#4B5563] max-w-md mx-auto">
                  Thank you for contacting Free JPEG Converter. Your reference ID is{' '}
                  <span className="font-mono font-semibold text-[#047857]">{ticketId}</span>.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setTicketId(null)}
                    className="min-h-[42px] px-4 py-2 text-[13.5px] font-semibold text-[#047857] border border-[#10B981] hover:bg-[#ECFDF5] rounded-[4px] cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full min-h-[42px] px-3 py-2 text-sm border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-[#374151] mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-h-[42px] px-3 py-2 text-sm border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-topic"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Topic
                  </label>
                  <select
                    id="contact-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857] cursor-pointer"
                  >
                    <option value="General Support">General Support</option>
                    <option value="Format or Compression Question">
                      Format or Compression Question
                    </option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Privacy & Data Inquiry">Privacy &amp; Data Inquiry</option>
                    <option value="API & Partnerships">API &amp; Partnerships</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-[#374151] mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    minLength={10}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full px-3 py-2.5 text-sm border border-[#D1D5DB] rounded-[4px] focus:outline-none focus:border-[#047857]"
                  />
                </div>

                {error && <p className="text-xs text-[#DC2626] font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 text-sm font-semibold bg-[#047857] hover:bg-[#065F46] text-white rounded-[4px] flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Direct Info Sidebar */}
          <aside className="space-y-4">
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-[14.5px] font-bold text-[#111827]">Direct Email</h2>
                  <p className="mt-0.5 text-[13px] text-[#4B5563]">
                    support@freejpegconverter.app
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-[14.5px] font-bold text-[#111827]">Response Window</h2>
                  <p className="mt-0.5 text-[13px] text-[#4B5563]">
                    Typically within 1 business day (Mon–Fri).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-[14.5px] font-bold text-[#111827]">Quick Resources</h2>
                  <ul className="mt-1 space-y-1 text-[13px]">
                    <li>
                      <a href="/#faq-heading" className="text-[#047857] hover:underline">
                        Read the JPEG Converter FAQ
                      </a>
                    </li>
                    <li>
                      <a href="/privacy-policy" className="text-[#047857] hover:underline">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="/terms-and-conditions" className="text-[#047857] hover:underline">
                        Terms and Conditions
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
