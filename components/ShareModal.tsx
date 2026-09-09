'use client';
// components/ShareModal.tsx
// ফর্মের পাবলিক লিংক কপি এবং WhatsApp, Messenger, Email ইত্যাদি মাধ্যমে সরাসরি শেয়ার করার পপআপ মডাল

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Share2,
  Send,
  MessageCircle,
} from 'lucide-react';
import { useLanguage, localizeFormText } from '@/context/LanguageContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formTitle?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  formId,
  formTitle,
}: ShareModalProps) {
  const { lang, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  const shareUrl = `${origin}/f/${formId}`;
  const localizedTitle = localizeFormText(formTitle, lang) || (lang === 'bn' ? 'অনলাইন ফর্ম' : 'Online Form');

  const shareText =
    lang === 'bn'
      ? `দয়া করে এই ফর্মটি পূরণ করুন: ${localizedTitle}`
      : `Please fill out this form: ${localizedTitle}`;

  // লিংক কপি ফাংশন
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // WhatsApp শেয়ার
  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Messenger / Facebook শেয়ার
  const handleMessenger = () => {
    // মোবাইল ডিভাইসে Messenger app লিঙ্ক, ডেস্কটপে Facebook/Messenger শেয়ার ডায়ালগ
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `fb-messenger://share?link=${encodeURIComponent(shareUrl)}`;
    } else {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  // Email শেয়ার
  const handleEmail = () => {
    const subject = encodeURIComponent(localizedTitle);
    const body = encodeURIComponent(
      lang === 'bn'
        ? `হ্যালো,\n\nদয়া করে নিচের লিংকে গিয়ে এই ফর্মটি পূরণ করুন:\n${shareUrl}\n\nধন্যবাদ!`
        : `Hello,\n\nPlease fill out this form at the following link:\n${shareUrl}\n\nThank you!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // ডিভাইস নেটিভ শেয়ার (মোবাইলে শেয়ার শিট ওপেন করে)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: localizedTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // ব্যবহারকারী বাতিল করলে কিছু করার প্রয়োজন নেই
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-6 relative">
        {/* ক্লোজ বাটন */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* হেডার */}
        <div className="space-y-1.5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            {t('shareModalTitle')}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {t('shareModalSubtitle')}
          </p>
        </div>

        {/* লিংক কপি বক্স */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-gray-200 rounded-2xl focus-within:border-indigo-600 transition shadow-inner">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-gray-700 outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t('copiedLinkMsg') : t('copyLinkBtn')}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] px-1 text-gray-400">
            <span>{localizedTitle}</span>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>{t('openInNewTab')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* সোশ্যাল শেয়ার বাটনসমূহ */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {t('sharePromptTitle')}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 transition group hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xs font-bold text-gray-800">{t('shareViaWhatsApp')}</span>
            </button>

            {/* Messenger */}
            <button
              onClick={handleMessenger}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/60 text-blue-800 transition group hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0084FF] text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xs font-bold text-gray-800">{t('shareViaMessenger')}</span>
            </button>

            {/* Email */}
            <button
              onClick={handleEmail}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-800 transition group hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">{t('shareViaEmail')}</span>
            </button>
          </div>

          {/* ডিভাইস নেটিভ শেয়ার বাটন */}
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-4 h-4 text-gray-500" />
            <span>{t('shareViaNative')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
