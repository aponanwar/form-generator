'use client';
// components/ThemeCustomizer.tsx
// ফর্মের রঙ, ব্যাকগ্রাউন্ড স্টাইল, কার্ড স্টাইল ও বাটন কাস্টমাইজ করার প্যানেল

import React from 'react';
import { ThemeSettings } from '@/types';
import { Palette, Layout, Sparkles, Sliders } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ThemeCustomizerProps {
  settings: ThemeSettings;
  onChange: (updatedSettings: ThemeSettings) => void;
}

// প্রিসেট কালারসমূহ
const PRESET_COLORS = [
  { nameEn: 'Royal Indigo', nameBn: 'রয়্যাল ইন্ডিগো', hex: '#4F46E5' },
  { nameEn: 'Emerald Green', nameBn: 'এমারেল্ড গ্রিন', hex: '#10B981' },
  { nameEn: 'Rose Pink', nameBn: 'রোজ পিঙ্ক', hex: '#F43F5E' },
  { nameEn: 'Electric Violet', nameBn: 'ইলেকট্রিক ভায়োলেট', hex: '#8B5CF6' },
  { nameEn: 'Ocean Cyan', nameBn: 'ওশান সায়ান', hex: '#06B6D4' },
  { nameEn: 'Sunset Amber', nameBn: 'সানসেট অ্যাম্বার', hex: '#F59E0B' },
  { nameEn: 'Midnight Slate', nameBn: 'মিডনাইট স্লেট', hex: '#0F172A' },
];

// ব্যানার গ্রেডিয়েন্ট প্রিসেট
const GRADIENT_PRESETS = [
  { nameEn: 'Indigo Purple', nameBn: 'ইন্ডিগো পার্পল', val: 'from-indigo-600 via-purple-600 to-pink-500' },
  { nameEn: 'Emerald Mint', nameBn: 'এমারেল্ড মিন্ট', val: 'from-emerald-500 via-teal-600 to-cyan-700' },
  { nameEn: 'Sunrise Flare', nameBn: 'সানরাইজ ফ্লেয়ার', val: 'from-rose-500 via-orange-500 to-amber-500' },
  { nameEn: 'Ocean Breeze', nameBn: 'ওশান ব্রিজ', val: 'from-cyan-500 via-blue-600 to-indigo-700' },
  { nameEn: 'Dark Cosmic', nameBn: 'ডার্ক কসমিক', val: 'from-gray-900 via-slate-800 to-zinc-900' },
];

export default function ThemeCustomizer({ settings, onChange }: ThemeCustomizerProps) {
  const { lang, t } = useLanguage();

  const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <Palette className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-gray-800 text-base">{t('themeTitle')}</h3>
      </div>

      {/* ১. থিম অ্যাকসেন্ট কালার নির্বাচন */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> {t('accentColor')}
        </label>
        <div className="flex flex-wrap gap-2.5">
          {PRESET_COLORS.map((c) => {
            const isSelected = settings.themeColor.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => updateSetting('themeColor', c.hex)}
                className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center shadow-sm ${
                  isSelected ? 'scale-125 ring-2 ring-offset-2 ring-gray-700' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
                title={lang === 'bn' ? c.nameBn : c.nameEn}
              >
                {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-gray-500">{t('customHex')}</span>
          <input
            type="text"
            value={settings.themeColor}
            onChange={(e) => updateSetting('themeColor', e.target.value)}
            className="w-24 px-2 py-1 text-xs border rounded font-mono uppercase focus:ring-1 focus:ring-indigo-500 outline-none"
            placeholder="#4F46E5"
          />
        </div>
      </div>

      {/* ২. ব্যাকগ্রাউন্ড থিম নির্বাচন */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5" /> {t('bgStyle')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'mesh', labelKey: 'bgMesh' as const, bgClass: 'bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50' },
            { id: 'gradient', labelKey: 'bgGradient' as const, bgClass: 'bg-gradient-to-b from-blue-50 to-slate-100' },
            { id: 'clean', labelKey: 'bgClean' as const, bgClass: 'bg-slate-50' },
            { id: 'warm', labelKey: 'bgWarm' as const, bgClass: 'bg-gradient-to-tr from-orange-50 to-amber-50' },
            { id: 'dark', labelKey: 'bgDark' as const, bgClass: 'bg-slate-900 text-white' },
          ].map((theme) => {
            const isSelected = settings.backgroundTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => updateSetting('backgroundTheme', theme.id as any)}
                className={`p-2.5 rounded-lg border text-xs font-medium text-center transition ${theme.bgClass} ${
                  isSelected ? 'border-indigo-600 ring-2 ring-indigo-500/20 font-bold' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t(theme.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ৩. কার্ড ডিজাইন */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" /> {t('cardStyleLabel')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'glassmorphic', labelKey: 'cardGlass' as const },
            { id: 'elevated', labelKey: 'cardElevated' as const },
            { id: 'bordered', labelKey: 'cardBordered' as const },
          ].map((card) => {
            const isSelected = settings.cardStyle === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => updateSetting('cardStyle', card.id as any)}
                className={`py-2 px-2 text-center rounded-lg border text-xs transition ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 font-bold text-indigo-900 ring-1 ring-indigo-500'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t(card.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ৪. হেডার ব্যানার গ্রেডিয়েন্ট */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {t('bannerGradientLabel')}
        </label>
        <div className="flex flex-wrap gap-2">
          {GRADIENT_PRESETS.map((g) => {
            const isSelected = settings.coverGradient === g.val;
            return (
              <button
                key={g.val}
                type="button"
                onClick={() => updateSetting('coverGradient', g.val)}
                className={`h-7 px-3 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r ${g.val} transition shadow-sm ${
                  isSelected ? 'ring-2 ring-offset-2 ring-gray-800 scale-105' : 'opacity-85 hover:opacity-100'
                }`}
              >
                {lang === 'bn' ? g.nameBn : g.nameEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* ৫. সাবমিট বাটন টেক্সট */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {t('submitButtonLabel')}
        </label>
        <input
          type="text"
          value={settings.buttonText}
          onChange={(e) => updateSetting('buttonText', e.target.value)}
          placeholder={t('submitButtonPlaceholder')}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>
    </div>
  );
}
