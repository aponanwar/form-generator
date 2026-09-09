'use client';
// components/FormRenderer.tsx
// কাস্টমাইজেবল ও প্রিমিয়াম ফর্ম রেন্ডারার (মাল্টি-কলাম গ্রিড ও একক ভাষা সমর্থন সহ)

import React, { useState } from 'react';
import { FormField, ThemeSettings } from '@/types';
import { AlertCircle, Calendar, Hash, Mail, Check, ChevronDown, Image as ImageIcon, FileText, UploadCloud, X, ExternalLink, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage, localizeFormText } from '@/context/LanguageContext';

interface FormRendererProps {
  title: string;
  description?: string;
  fields: FormField[];
  settings: ThemeSettings;
  onSubmit?: (answers: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  previewMode?: boolean;
}

export default function FormRenderer({
  title,
  description,
  fields,
  settings,
  onSubmit,
  previewMode = false,
}: FormRendererProps) {
  const { lang, t } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  // ফাইল আপলোড হ্যান্ডলার (Cloudinary CDN এ আপলোড)
  const handleFileUpload = async (fieldId: string, file: File, maxSizeMB: number = 5) => {
    if (!file) return;
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadErrors((prev) => ({
        ...prev,
        [fieldId]: `${t('sizeExceededError')} ${maxSizeMB} MB (${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
      }));
      return;
    }

    setUploadErrors((prev) => ({ ...prev, [fieldId]: '' }));
    setUploadingFields((prev) => ({ ...prev, [fieldId]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('maxSizeMB', String(maxSizeMB));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      handleAnswerChange(fieldId, data.url);
    } catch (err: any) {
      setUploadErrors((prev) => ({
        ...prev,
        [fieldId]: err.message || 'Upload error',
      }));
    } finally {
      setUploadingFields((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  // ব্যাকগ্রাউন্ড ক্লাস নির্বাচন
  const getBackgroundClass = () => {
    switch (settings.backgroundTheme) {
      case 'mesh':
        return 'bg-gradient-to-tr from-indigo-50/70 via-purple-50/60 to-pink-50/70';
      case 'gradient':
        return 'bg-gradient-to-b from-blue-50/80 to-slate-100/90';
      case 'warm':
        return 'bg-gradient-to-tr from-orange-50/70 via-amber-50/60 to-yellow-50/50';
      case 'dark':
        return 'bg-slate-900 text-white';
      case 'clean':
      default:
        return 'bg-slate-50';
    }
  };

  // কার্ড স্টাইল ক্লাস নির্বাচন
  const getCardClass = () => {
    const isDark = settings.backgroundTheme === 'dark';
    switch (settings.cardStyle) {
      case 'glassmorphic':
        return isDark
          ? 'bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 shadow-xl'
          : 'bg-white/85 backdrop-blur-xl border border-white/60 shadow-lg shadow-gray-200/40';
      case 'bordered':
        return isDark
          ? 'bg-slate-800 border-2 border-slate-700 shadow-sm'
          : 'bg-white border-2 border-gray-100 shadow-sm';
      case 'elevated':
      default:
        return isDark
          ? 'bg-slate-800 shadow-2xl border border-slate-700'
          : 'bg-white shadow-xl shadow-indigo-100/30 border border-gray-100';
    }
  };

  // প্রতিটি ফিল্ডের জন্য একক কার্ড স্টাইল ক্লাস নির্বাচন
  const getFieldCardClass = (style?: 'default' | 'subtle' | 'highlight' | 'glass') => {
    const isDark = settings.backgroundTheme === 'dark';
    switch (style) {
      case 'subtle':
        return isDark
          ? 'bg-slate-800/40 border border-slate-700/60 shadow-xs'
          : 'bg-slate-50/80 border border-slate-200/80 shadow-xs';
      case 'highlight':
        return isDark
          ? 'bg-indigo-950/30 border-2 border-indigo-500/50 shadow-md'
          : 'bg-indigo-50/50 border-2 border-indigo-200/80 shadow-sm';
      case 'glass':
        return isDark
          ? 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 shadow-lg'
          : 'bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg shadow-gray-200/40';
      case 'default':
      default:
        return getCardClass();
    }
  };

  // গ্রিড কলাম উইডথ ক্লাস (একটি সারিতে একাধিক ফিল্ড বসানোর জন্য)
  const getFieldGridColSpan = (width?: 'full' | 'half' | 'third') => {
    switch (width) {
      case 'half':
        return 'col-span-12 sm:col-span-6'; // সারিতে পাশাপাশি ২টি ফিল্ড
      case 'third':
        return 'col-span-12 sm:col-span-4'; // সারিতে পাশাপাশি ৩টি ফিল্ড
      case 'full':
      default:
        return 'col-span-12'; // সম্পূর্ণ সারি (১টি ফিল্ড)
    }
  };

  // উত্তরের অগ্রগতি (Progress Bar) হিসাব
  const totalRequired = fields.filter((f) => f.required).length;
  const answeredRequired = fields.filter((f) => {
    if (!f.required) return false;
    const val = answers[f.id];
    return val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0);
  }).length;
  const progressPercent = totalRequired > 0 ? Math.round((answeredRequired / totalRequired) * 100) : 100;

  const handleAnswerChange = (fieldId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    const currentList: string[] = answers[fieldId] || [];
    const nextList = currentList.includes(option)
      ? currentList.filter((item) => item !== option)
      : [...currentList, option];
    handleAnswerChange(fieldId, nextList);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewMode) {
      alert(t('previewModeAlert'));
      return;
    }

    setErrorMessage('');
    setSubmitting(true);

    try {
      if (onSubmit) {
        const res = await onSubmit(answers);
        if (res.success) {
          setIsSubmitted(true);
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (e) {}
        } else {
          setErrorMessage(res.error || t('submissionFailed'));
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || t('networkError'));
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = settings.backgroundTheme === 'dark';

  // সাবমিট সফল হলে কনফার্মেশন স্ক্রিন
  if (isSubmitted) {
    return (
      <div className={`min-h-[500px] flex items-center justify-center p-6 ${getBackgroundClass()}`}>
        <div className={`max-w-md w-full p-8 rounded-2xl text-center space-y-4 ${getCardClass()}`}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white shadow-lg animate-bounce"
            style={{ backgroundColor: settings.themeColor }}
          >
            <Check className="w-8 h-8" />
          </div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('thankYouTitle')}
          </h2>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('thankYouMessage')}
          </p>
          <button
            onClick={() => {
              setAnswers({});
              setIsSubmitted(false);
            }}
            className="text-xs font-semibold underline pt-2 text-indigo-500 hover:text-indigo-600"
          >
            {t('submitAnother')}
          </button>
        </div>
      </div>
    );
  }

  const localizedTitle = localizeFormText(title, lang) || t('untitledForm');
  const localizedDescription = localizeFormText(description, lang);
  const localizedButtonText = localizeFormText(settings.buttonText, lang) || t('submitBtnDefault');

  return (
    <div className={`min-h-full py-8 px-4 sm:px-6 transition-all duration-300 ${getBackgroundClass()}`}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* প্রগ্রেস বার */}
        {totalRequired > 0 && (
          <div className="bg-white/50 backdrop-blur-md rounded-full p-1 border border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between px-3 text-[11px] font-semibold text-gray-500 mb-1">
              <span>{t('progressLabel')}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200/70 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: settings.themeColor,
                }}
              />
            </div>
          </div>
        )}

        {/* হেডার কার্ড */}
        <div className={`rounded-2xl overflow-hidden ${getCardClass()} transition-all`}>
          <div
            className={`h-32 w-full bg-gradient-to-r ${
              settings.coverGradient || 'from-indigo-600 via-purple-600 to-pink-500'
            } relative flex items-end p-6`}
          >
            <div className="absolute inset-0 bg-black/10 backdrop-brightness-95" />
          </div>

          <div className="p-6 sm:p-8 space-y-3 relative">
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {localizedTitle}
            </h1>
            {localizedDescription && (
              <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {localizedDescription}
              </p>
            )}
            {totalRequired > 0 && (
              <div className="pt-2 text-xs font-medium text-red-500 flex items-center gap-1">
                <span>{t('requiredNote')}</span>
              </div>
            )}
          </div>
        </div>

        {/* প্রশ্ন ও ইনপুট ফিল্ডসমূহ (১২-কলাম CSS গ্রিড) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            {fields.map((field, index) => {
              const isAnswered = answers[field.id] !== undefined && answers[field.id] !== '';
              const colSpanClass = getFieldGridColSpan(field.width);
              const localizedLabel = localizeFormText(field.label, lang);
              const localizedPlaceholder = field.placeholder ? localizeFormText(field.placeholder, lang) : t('enterAnswer');
              const fieldAccent = field.customColor || settings.themeColor;

              return (
                <div
                  key={field.id}
                  className={`${colSpanClass} p-6 rounded-2xl transition-all duration-200 ${getFieldCardClass(
                    field.fieldCardStyle
                  )} ${isAnswered ? 'ring-1' : ''}`}
                  style={{
                    borderColor: isAnswered || field.customColor ? fieldAccent : undefined,
                    boxShadow: field.customColor && isAnswered ? `0 0 0 1px ${fieldAccent}` : undefined,
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <label className={`block font-semibold text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        <span className="text-gray-400 mr-1.5 text-sm">#{index + 1}</span>
                        {localizedLabel}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {(field.type === 'image' || field.type === 'file') && (
                        <span className="text-[11px] text-gray-400 font-medium shrink-0">
                          {t('maxSizeLabel')} {field.maxSizeMB || 5}MB
                        </span>
                      )}
                    </div>

                    {field.description && (
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {localizeFormText(field.description, lang)}
                      </p>
                    )}

                    {/* ১. টেক্সট ইনপুট */}
                    {field.type === 'text' && (
                      <input
                        type="text"
                        required={field.required}
                        placeholder={localizedPlaceholder}
                        value={answers[field.id] || ''}
                        onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                        className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition ${
                          isDark
                            ? 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-400'
                            : 'bg-white border-gray-200 text-gray-800 focus:border-indigo-500'
                        }`}
                        style={{
                          borderColor: answers[field.id] ? fieldAccent : undefined,
                        }}
                      />
                    )}

                    {/* ২. প্যারাগ্রাফ ইনপুট */}
                    {field.type === 'paragraph' && (
                      <textarea
                        required={field.required}
                        rows={3}
                        placeholder={localizedPlaceholder}
                        value={answers[field.id] || ''}
                        onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                        className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition resize-none ${
                          isDark
                            ? 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-400'
                            : 'bg-white border-gray-200 text-gray-800 focus:border-indigo-500'
                        }`}
                        style={{
                          borderColor: answers[field.id] ? fieldAccent : undefined,
                        }}
                      />
                    )}

                    {/* ৩. সংখ্যা ইনপুট */}
                    {field.type === 'number' && (
                      <div className="relative">
                        <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                        <input
                          type="number"
                          required={field.required}
                          placeholder={field.placeholder || '0'}
                          value={answers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none transition ${
                            isDark
                              ? 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-400'
                              : 'bg-white border-gray-200 text-gray-800 focus:border-indigo-500'
                          }`}
                          style={{
                            borderColor: answers[field.id] ? fieldAccent : undefined,
                          }}
                        />
                      </div>
                    )}

                    {/* ৪. ইমেইল ইনপুট */}
                    {field.type === 'email' && (
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required={field.required}
                          placeholder={field.placeholder || 'example@email.com'}
                          value={answers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none transition ${
                            isDark
                              ? 'bg-slate-900/80 border-slate-700 text-white focus:border-indigo-400'
                            : 'bg-white border-gray-200 text-gray-800 focus:border-indigo-500'
                          }`}
                          style={{
                            borderColor: answers[field.id] ? fieldAccent : undefined,
                          }}
                        />
                      </div>
                    )}

                    {/* ৫. রেডিও অপশন (একক পছন্দ) */}
                    {field.type === 'radio' && (
                      <div className="space-y-2 pt-1">
                        {field.options?.map((opt, i) => {
                          const isChecked = answers[field.id] === opt;
                          const localizedOpt = localizeFormText(opt, lang);
                          return (
                            <label
                              key={i}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                                isChecked
                                  ? 'bg-indigo-50/50 border-indigo-500 shadow-sm'
                                  : isDark
                                  ? 'bg-slate-900/50 border-slate-700 hover:bg-slate-900'
                                  : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100/50'
                              }`}
                              style={{
                                borderColor: isChecked ? fieldAccent : undefined,
                                backgroundColor: isChecked ? `${fieldAccent}15` : undefined,
                              }}
                            >
                              <input
                                type="radio"
                                name={field.id}
                                required={field.required && !answers[field.id]}
                                value={opt}
                                checked={isChecked}
                                onChange={() => handleAnswerChange(field.id, opt)}
                                className="w-4 h-4"
                                style={{ accentColor: fieldAccent }}
                              />
                              <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                {localizedOpt}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* ৬. চেকবক্স (একাধিক পছন্দ) */}
                    {field.type === 'checkbox' && (
                      <div className="space-y-2 pt-1">
                        {field.options?.map((opt, i) => {
                          const currentList: string[] = answers[field.id] || [];
                          const isChecked = currentList.includes(opt);
                          const localizedOpt = localizeFormText(opt, lang);
                          return (
                            <label
                              key={i}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                                isChecked
                                  ? 'bg-indigo-50/50 border-indigo-500 shadow-sm'
                                  : isDark
                                  ? 'bg-slate-900/50 border-slate-700 hover:bg-slate-900'
                                  : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100/50'
                              }`}
                              style={{
                                borderColor: isChecked ? fieldAccent : undefined,
                                backgroundColor: isChecked ? `${fieldAccent}15` : undefined,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxToggle(field.id, opt)}
                                className="w-4 h-4 rounded"
                                style={{ accentColor: fieldAccent }}
                              />
                              <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                {localizedOpt}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* ৭. ড্রপডাউন সিলেক্ট */}
                    {field.type === 'dropdown' && (
                      <div className="relative">
                        <select
                          required={field.required}
                          value={answers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                          className={`w-full px-4 py-3 text-sm rounded-xl border outline-none appearance-none cursor-pointer transition ${
                            isDark
                              ? 'bg-slate-900/80 border-slate-700 text-white'
                              : 'bg-white border-gray-200 text-gray-800'
                          }`}
                          style={{
                            borderColor: answers[field.id] ? fieldAccent : undefined,
                          }}
                        >
                          <option value="">{t('selectOption')}</option>
                          {field.options?.map((opt, i) => (
                            <option key={i} value={opt}>
                              {localizeFormText(opt, lang)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-3.5 pointer-events-none" />
                      </div>
                    )}

                    {/* ৮. তারিখ ইনপুট */}
                    {field.type === 'date' && (
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                        <input
                          type="date"
                          required={field.required}
                          value={answers[field.id] || ''}
                          onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border outline-none transition ${
                            isDark
                              ? 'bg-slate-900/80 border-slate-700 text-white'
                              : 'bg-white border-gray-200 text-gray-800'
                          }`}
                          style={{
                            borderColor: answers[field.id] ? fieldAccent : undefined,
                          }}
                        />
                      </div>
                    )}

                    {/* ৯. ছবি আপলোড (Cloudinary CDN) */}
                    {field.type === 'image' && (
                      <div className="space-y-2">
                        {answers[field.id] ? (
                          <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-slate-100 max-w-sm">
                            <img
                              src={answers[field.id]}
                              alt="Uploaded preview"
                              className="w-full h-48 object-cover rounded-xl transition group-hover:brightness-90"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <a
                                href={answers[field.id]}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md hover:bg-gray-100 transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{t('viewImage')}</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleAnswerChange(field.id, '')}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md hover:bg-red-700 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>{t('removeFile')}</span>
                              </button>
                            </div>
                          </div>
                        ) : uploadingFields[field.id] ? (
                          <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 bg-indigo-50/20">
                            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                            <span className="text-xs font-semibold text-gray-600">{t('uploadingFile')}</span>
                          </div>
                        ) : (
                          <label
                            className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:border-indigo-400 hover:bg-indigo-50/20 group ${
                              isDark ? 'border-slate-700 bg-slate-900/40' : 'border-gray-200 bg-gray-50/50'
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              required={field.required && !answers[field.id]}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(field.id, file, field.maxSizeMB || 5);
                              }}
                            />
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                              style={{ backgroundColor: `${fieldAccent}18`, color: fieldAccent }}
                            >
                              <ImageIcon className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold" style={{ color: fieldAccent }}>
                                {t('uploadPromptImage')}
                              </p>
                              <p className="text-[11px] text-gray-400 font-medium">
                                JPG, PNG, WEBP, GIF (Max {field.maxSizeMB || 5}MB)
                              </p>
                            </div>
                          </label>
                        )}

                        {uploadErrors[field.id] && (
                          <p className="text-xs text-red-500 font-medium flex items-center gap-1 pt-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{uploadErrors[field.id]}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* ১০. সাধারণ ফাইল বা ডকুমেন্ট আপলোড */}
                    {field.type === 'file' && (
                      <div className="space-y-2">
                        {answers[field.id] ? (
                          <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-slate-50/80 shadow-xs">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${fieldAccent}18`, color: fieldAccent }}
                              >
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-semibold text-gray-800 truncate max-w-xs">
                                {answers[field.id].split('/').pop()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={answers[field.id]}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                                style={{ color: fieldAccent }}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{t('viewFile')}</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleAnswerChange(field.id, '')}
                                className="p-1 text-gray-400 hover:text-red-600 rounded-md transition"
                                title={t('removeFile')}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : uploadingFields[field.id] ? (
                          <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 bg-indigo-50/20">
                            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                            <span className="text-xs font-semibold text-gray-600">{t('uploadingFile')}</span>
                          </div>
                        ) : (
                          <label
                            className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:border-indigo-400 hover:bg-indigo-50/20 group ${
                              isDark ? 'border-slate-700 bg-slate-900/40' : 'border-gray-200 bg-gray-50/50'
                            }`}
                          >
                            <input
                              type="file"
                              className="hidden"
                              required={field.required && !answers[field.id]}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(field.id, file, field.maxSizeMB || 5);
                              }}
                            />
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                              style={{ backgroundColor: `${fieldAccent}18`, color: fieldAccent }}
                            >
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold" style={{ color: fieldAccent }}>
                                {t('uploadPromptFile')}
                              </p>
                              <p className="text-[11px] text-gray-400 font-medium">
                                PDF, DOCX, ZIP, XLSX, TXT (Max {field.maxSizeMB || 5}MB)
                              </p>
                            </div>
                          </label>
                        )}

                        {uploadErrors[field.id] && (
                          <p className="text-xs text-red-500 font-medium flex items-center gap-1 pt-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{uploadErrors[field.id]}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ত্রুটি বার্তা */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* সাবমিট বাটন */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: settings.themeColor,
              }}
            >
              {submitting ? (
                <span>{t('submittingBtn')}</span>
              ) : (
                <span>{localizedButtonText}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
