'use client';
// app/(auth)/reset-password/page.tsx
// পাসওয়ার্ড রিসেট ফর্ম পেজ (টোকেন যাচাই এবং নতুন পাসওয়ার্ড সংরক্ষণ)

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, t } = useLanguage();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token || !email) {
      setErrorMsg(t('invalidResetLink'));
      return;
    }

    if (password.length < 6) {
      setErrorMsg(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password, lang }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || (lang === 'bn' ? 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।' : 'Password reset failed.'));
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setErrorMsg(lang === 'bn' ? 'সার্ভারে সংযোগে সমস্যা হয়েছে।' : 'Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">{t('invalidResetLink')}</h2>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
        >
          <span>{t('forgotPasswordTitle')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* হেডার */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-md">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('resetPasswordTitle')}</h2>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">{t('resetPasswordSubtitle')}</p>
        <div className="text-[11px] text-indigo-600 font-semibold">{email}</div>
      </div>

      {success ? (
        <div className="space-y-5 animate-in fade-in zoom-in-95">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-900">{t('passwordResetSuccessTitle')}</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              {t('passwordResetSuccessDesc')}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <span>{t('goToLogin')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">{t('newPasswordLabel')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
              />
            </div>
            <p className="text-[10px] text-gray-400">{t('passwordMinNote')}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">{t('confirmPasswordLabel')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
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
            <span>{loading ? t('resettingPassword') : t('resetPasswordSubmit')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-purple-50/30">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-gray-100 p-8">
        <Suspense fallback={<div className="text-center text-xs text-gray-400 py-8">Loading...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
