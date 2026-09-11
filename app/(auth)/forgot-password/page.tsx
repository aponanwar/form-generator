'use client';
// app/(auth)/forgot-password/page.tsx
// পাসওয়ার্ড ভুলে যাওয়া ব্যবহারকারীদের জন্য রিসেট লিংক পাঠানোর পেজ (দ্বিভাষিক সমর্থন সহ)

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ForgotPasswordPage() {
  const { lang, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    setSuccess(false);
    setDevResetUrl(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || (lang === 'bn' ? 'অনুরোধটি ব্যর্থ হয়েছে।' : 'Request failed.'));
      } else {
        setSuccess(true);
        if (data.devResetUrl) {
          setDevResetUrl(data.devResetUrl);
        }
      }
    } catch (err) {
      setErrorMsg(lang === 'bn' ? 'সার্ভারে সংযোগে সমস্যা হয়েছে।' : 'Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-purple-50/30">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8 space-y-6">
        {/* হেডার */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-md">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('forgotPasswordTitle')}</h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            {t('forgotPasswordSubtitle')}
          </p>
        </div>

        {/* সফল নোটিশ স্ক্রিন */}
        {success ? (
          <div className="space-y-5 animate-in fade-in zoom-in-95">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-900">{t('resetLinkSentTitle')}</h3>
              <p className="text-xs text-emerald-700 leading-relaxed">
                {t('resetLinkSentDesc')} <strong className="font-semibold text-emerald-900">{email}</strong>
              </p>
            </div>

            {/* লোকাল ডেভেলপমেন্ট টেস্ট লিঙ্ক (যদি SMTP ভেরিয়েবল না থাকে) */}
            {devResetUrl && (
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <span>{t('devDirectLinkNotice')}</span>
                </div>
                <Link
                  href={devResetUrl}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline break-all"
                >
                  <span>{devResetUrl}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('backToLogin')}</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ইমেইল ইনপুট ফর্ম */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">{t('emailLabel')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? t('sendingLink') : t('sendResetLinkBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('backToLogin')}</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
