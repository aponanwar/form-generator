'use client';
// app/page.tsx
// NextForm-এর আকর্ষণীয় ও আধুনিক ল্যান্ডিং পেজ (ভাষা টগল সমর্থন সহ)

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Sparkles, FileSpreadsheet, ShieldCheck, Palette, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-50 via-white to-indigo-50/30">
      {/* হিরো সেকশন */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('heroBadge')}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          {t('heroTitlePrefix')} <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            {t('heroTitleGradient')}
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed">
          {t('heroDescription')}
        </p>

        {/* কল টু অ্যাকশন বাটন */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={session ? '/dashboard' : '/register'}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <span>{session ? t('heroCtaDashboard') : t('heroCtaRegister')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-semibold text-sm sm:text-base rounded-xl shadow-sm transition"
          >
            {t('heroCtaLogin')}
          </Link>
        </div>

        {/* ফিচার ব্যাজসমূহ */}
        <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t('badgeNoCode')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t('badgeGoogleAuth')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t('badgeExcelExport')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t('badgeVercel')}</span>
          </div>
        </div>

        {/* ভিজ্যুয়াল ডেমো প্রিভিউ কার্ড */}
        <div className="pt-8 max-w-4xl mx-auto">
          <div className="p-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">
            <div className="bg-white rounded-xl p-6 sm:p-8 text-left space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-400 ml-2">nextform.app/f/demo</span>
                </div>
                <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full">
                  {t('livePreviewBadge')}
                </span>
              </div>

              <div className="space-y-4">
                <div className="h-4 w-1/3 bg-indigo-100 rounded animate-pulse" />
                <div className="h-10 w-full border border-gray-200 rounded-lg p-3 text-xs text-gray-400 flex items-center justify-between">
                  <span>{t('enterAnswer')}</span>
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* প্রধান সুবিধাসমূহ */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t('whyTitle')}
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              {t('whySubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-100 space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">{t('feature1Title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t('feature1Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-100 space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">{t('feature2Title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t('feature2Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-100 space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">{t('feature3Title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {t('feature3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
