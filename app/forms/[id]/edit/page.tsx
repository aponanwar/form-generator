'use client';
// app/forms/[id]/edit/page.tsx
// আধুনিক ফর্ম বিল্ডার: ড্র্যাগ-অ্যান্ড-ড্রপ রি-অর্ডারিং, মাল্টি-ফিল্ড রো গ্রিড লেআউট ও ভাষা নির্বাচন

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FormField, FieldType, ThemeSettings } from '@/types';
import ThemeCustomizer from '@/components/ThemeCustomizer';
import FormRenderer from '@/components/FormRenderer';
import ShareModal from '@/components/ShareModal';
import { useLanguage, localizeFormText } from '@/context/LanguageContext';
import {
  Save,
  ArrowLeft,
  Eye,
  Plus,
  Trash2,
  Share2,
  Check,
  BarChart2,
  Layers,
  Sparkles,
  GripVertical,
  Columns2,
  Columns3,
  Square,
  Image as ImageIcon,
  FileUp,
  Palette,
} from 'lucide-react';

export default function FormBuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang, t } = useLanguage();

  // ফর্মের স্টেট
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<ThemeSettings>({
    themeColor: '#4F46E5',
    backgroundTheme: 'mesh',
    cardStyle: 'glassmorphic',
    buttonText: 'Submit',
    coverGradient: 'from-indigo-600 via-purple-600 to-pink-500',
  });

  const [activeTab, setActiveTab] = useState<'fields' | 'theme' | 'preview'>('fields');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // ড্র্যাগ অ্যান্ড ড্রপ স্টেট
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ফিল্ড কাস্টম ডিজাইন ও কালার প্যানেল স্টেট
  const [designFieldId, setDesignFieldId] = useState<string | null>(null);

  // ফর্মের ডেটা ফেচ করা
  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/forms/${id}`);
        if (!res.ok) throw new Error('Form not found');
        const data = await res.json();
        setTitle(localizeFormText(data.title, lang) || '');
        setDescription(localizeFormText(data.description, lang) || '');
        setFields(
          (data.fields || []).map((f: FormField) => ({
            ...f,
            label: localizeFormText(f.label, lang),
            placeholder: f.placeholder ? localizeFormText(f.placeholder, lang) : '',
            options: f.options ? f.options.map((opt: string) => localizeFormText(opt, lang)) : undefined,
          }))
        );
        if (data.settings) {
          setSettings({
            ...data.settings,
            buttonText: localizeFormText(data.settings.buttonText, lang) || (lang === 'en' ? 'Submit' : 'জমা দিন'),
          });
        }
      } catch (err: any) {
        setMessage(t('saveErrorMsg'));
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [id]);

  // ভাষা পরিবর্তিত হলে স্বয়ংক্রিয়ভাবে ডিফল্ট টেক্সটসমূহ অনুবাদ করা
  useEffect(() => {
    if (!loading) {
      setTitle((prev) => localizeFormText(prev, lang));
      setDescription((prev) => localizeFormText(prev, lang));
      setFields((prev) =>
        prev.map((f) => ({
          ...f,
          label: localizeFormText(f.label, lang),
          placeholder: f.placeholder ? localizeFormText(f.placeholder, lang) : '',
          options: f.options ? f.options.map((opt) => localizeFormText(opt, lang)) : undefined,
        }))
      );
      setSettings((prev) => ({
        ...prev,
        buttonText: localizeFormText(prev.buttonText, lang) || (lang === 'en' ? 'Submit' : 'জমা দিন'),
      }));
    }
  }, [lang]);

  // নতুন ফিল্ড যোগ করার ফাংশন
  const handleAddField = (type: FieldType) => {
    const defaultLabel =
      lang === 'bn'
        ? `নতুন প্রশ্ন (${type})`
        : `New Question (${type})`;

    const defaultOptions =
      lang === 'bn'
        ? ['বিকল্প ১', 'বিকল্প ২']
        : ['Option 1', 'Option 2'];

    const newField: FormField = {
      id: 'field_' + Math.random().toString(36).substring(2, 9),
      type,
      label: defaultLabel,
      placeholder: '',
      required: false,
      width: 'full', // ডিফল্ট ফুল উইডথ
      options: ['radio', 'checkbox', 'dropdown'].includes(type) ? defaultOptions : undefined,
      maxSizeMB: ['image', 'file'].includes(type) ? 5 : undefined,
    };
    setFields([...fields, newField]);
  };

  // ফিল্ড ডিলিট করা
  const handleDeleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // ফিল্ডের উইডথ পরিবর্তন করা (Full, Half, Third)
  const handleWidthChange = (fieldIndex: number, width: 'full' | 'half' | 'third') => {
    const updated = [...fields];
    updated[fieldIndex].width = width;
    setFields(updated);
  };

  // রেডিও/চেকবক্স অপশন বৃদ্ধি করা
  const handleAddOption = (fieldIndex: number) => {
    const updated = [...fields];
    const targetField = updated[fieldIndex];
    if (targetField.options) {
      const optText = lang === 'bn' ? `বিকল্প ${targetField.options.length + 1}` : `Option ${targetField.options.length + 1}`;
      targetField.options.push(optText);
      setFields(updated);
    }
  };

  // অপশন মুছে ফেলা
  const handleDeleteOption = (fieldIndex: number, optionIndex: number) => {
    const updated = [...fields];
    const targetField = updated[fieldIndex];
    if (targetField.options) {
      targetField.options = targetField.options.filter((_, i) => i !== optionIndex);
      setFields(updated);
    }
  };

  // ড্র্যাগ অ্যান্ড ড্রপ হ্যান্ডলারসমূহ
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // ফিল্ড স্থান পরিবর্তন (Re-ordering)
    const updated = [...fields];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    setFields(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ফর্ম ডাটাবেজে সেভ করা (র মঙ্গোডিবি আপডেট)
  const handleSaveForm = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          fields,
          settings,
        }),
      });

      if (res.ok) {
        setMessage(t('savedMsg'));
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(t('saveErrorMsg'));
      }
    } catch (err) {
      setMessage(t('saveErrorMsg'));
    } finally {
      setSaving(false);
    }
  };

  // পাবলিক লিংক কপি করা
  const handleCopyLink = () => {
    const url = `${window.location.origin}/f/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ফিল্ড কলাম স্প্যান ক্লাস
  const getColSpanClass = (width?: 'full' | 'half' | 'third') => {
    switch (width) {
      case 'half':
        return 'col-span-12 md:col-span-6'; // ২টি ফিল্ড এক রো তে
      case 'third':
        return 'col-span-12 md:col-span-4'; // ৩টি ফিল্ড এক রো তে
      case 'full':
      default:
        return 'col-span-12';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* টপ টুলবার */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-sm font-bold text-gray-800 max-w-xs truncate">
              {title || t('untitledForm')}
            </h2>
            <span className="text-[10px] text-gray-400 font-medium">{t('builderMode')}</span>
          </div>
        </div>

        {/* ট্যাব নেভিগেশন */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('fields')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'fields'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('tabFields')}</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'theme'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('tabTheme')}</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'preview'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('tabPreview')}</span>
          </button>
        </div>

        {/* ডানদিকের অ্যাকশন বাটনসমূহ */}
        <div className="flex items-center gap-2">
          <Link
            href={`/forms/${id}/responses`}
            className="px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 flex items-center gap-1.5 transition"
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">{t('viewResponses')}</span>
          </Link>

          <button
            onClick={() => setShowShareModal(true)}
            className="px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 flex items-center gap-1.5 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">{t('shareBtn')}</span>
          </button>

          <button
            onClick={handleSaveForm}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? t('savingBtn') : t('saveBtn')}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border-b border-emerald-200 py-2 text-center text-xs font-bold text-emerald-700 animate-fade-in">
          {message}
        </div>
      )}

      {/* ট্যাব কনটেন্ট */}
      <div className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
        {/* ১. ফিল্ড ও প্রশ্ন ট্যাব */}
        {activeTab === 'fields' && (
          <div className="space-y-6">
            {/* ফর্মের শিরোনাম ও বিবরণ এডিটর */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className={`h-4 w-full bg-gradient-to-r ${settings.coverGradient || 'from-indigo-600 to-purple-600'}`}
              />
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('formTitlePlaceholder')}
                  className="w-full text-2xl sm:text-3xl font-extrabold text-gray-900 border-b border-gray-200 focus:border-indigo-600 outline-none pb-2 transition"
                />
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('formDescPlaceholder')}
                  className="w-full text-sm text-gray-600 border-b border-gray-100 focus:border-indigo-600 outline-none resize-none transition"
                />
              </div>
            </div>

            {/* ফিল্ড তালিকা (ড্র্যাগেবল ও রেসপনসিভ ১২-কলাম গ্রিড) */}
            <div className="grid grid-cols-12 gap-4">
              {fields.map((field, fIdx) => {
                const colSpanClass = getColSpanClass(field.width);
                const isDragging = draggedIndex === fIdx;
                const isOver = dragOverIndex === fIdx;

                return (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, fIdx)}
                    onDragOver={(e) => handleDragOver(e, fIdx)}
                    onDrop={(e) => handleDrop(e, fIdx)}
                    onDragEnd={handleDragEnd}
                    className={`${colSpanClass} bg-white rounded-2xl border transition-all duration-200 shadow-sm p-5 space-y-4 ${
                      isDragging
                        ? 'opacity-40 scale-95 border-indigo-500 border-dashed'
                        : isOver
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md scale-[1.01]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      borderLeft: field.customColor ? `4px solid ${field.customColor}` : undefined,
                    }}
                  >
                    {/* কার্ডের উপরের কন্ট্রোলস ও ড্র্যাগ হ্যান্ডেল */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-indigo-600 rounded flex items-center gap-1"
                        title={lang === 'bn' ? 'টেনে স্থানান্তর করুন' : 'Drag to reorder'}
                      >
                        <GripVertical className="w-4 h-4 shrink-0" />
                        <span className="text-[11px] font-bold text-gray-400">#{fIdx + 1}</span>
                      </div>

                      {/* ফিল্ডের উইডথ নির্বাচন (Full, Half, Third) */}
                      <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[10px] font-semibold text-gray-600">
                        <button
                          type="button"
                          onClick={() => handleWidthChange(fIdx, 'full')}
                          className={`px-2 py-0.5 rounded flex items-center gap-1 transition ${
                            !field.width || field.width === 'full'
                              ? 'bg-white text-indigo-600 shadow-xs font-bold'
                              : 'hover:text-gray-900'
                          }`}
                          title={t('widthFull')}
                        >
                          <Square className="w-3 h-3" />
                          <span>100%</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWidthChange(fIdx, 'half')}
                          className={`px-2 py-0.5 rounded flex items-center gap-1 transition ${
                            field.width === 'half'
                              ? 'bg-white text-indigo-600 shadow-xs font-bold'
                              : 'hover:text-gray-900'
                          }`}
                          title={t('widthHalf')}
                        >
                          <Columns2 className="w-3 h-3" />
                          <span>50%</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWidthChange(fIdx, 'third')}
                          className={`px-2 py-0.5 rounded flex items-center gap-1 transition ${
                            field.width === 'third'
                              ? 'bg-white text-indigo-600 shadow-xs font-bold'
                              : 'hover:text-gray-900'
                          }`}
                          title={t('widthThird')}
                        >
                          <Columns3 className="w-3 h-3" />
                          <span>33%</span>
                        </button>
                      </div>
                    </div>

                    {/* ফিল্ড শিরোনাম ও টাইপ নির্বাচন */}
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...fields];
                          updated[fIdx].label = e.target.value;
                          setFields(updated);
                        }}
                        placeholder={t('fieldLabelPlaceholder')}
                        className="w-full font-bold text-sm sm:text-base text-gray-800 border-b border-gray-200 focus:border-indigo-600 outline-none pb-1"
                      />

                      <select
                        value={field.type}
                        onChange={(e) => {
                          const updated = [...fields];
                          const newType = e.target.value as FieldType;
                          updated[fIdx].type = newType;
                          if (['radio', 'checkbox', 'dropdown'].includes(newType) && !updated[fIdx].options) {
                            updated[fIdx].options = [
                              lang === 'bn' ? 'বিকল্প ১' : 'Option 1',
                              lang === 'bn' ? 'বিকল্প ২' : 'Option 2',
                            ];
                          }
                          if (['image', 'file'].includes(newType) && !updated[fIdx].maxSizeMB) {
                            updated[fIdx].maxSizeMB = 5;
                          }
                          setFields(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg text-gray-700 outline-none"
                      >
                        <option value="text">{t('fieldShortText')}</option>
                        <option value="paragraph">{t('fieldParagraph')}</option>
                        <option value="number">{t('fieldNumber')}</option>
                        <option value="email">{t('fieldEmail')}</option>
                        <option value="radio">{t('fieldRadio')}</option>
                        <option value="checkbox">{t('fieldCheckbox')}</option>
                        <option value="dropdown">{t('fieldDropdown')}</option>
                        <option value="date">{t('fieldDate')}</option>
                        <option value="image">{t('fieldImage')}</option>
                        <option value="file">{t('fieldFile')}</option>
                      </select>
                    </div>

                    {/* ফাইল ও ছবির সর্বোচ্চ আকার নির্বাচন */}
                    {(field.type === 'image' || field.type === 'file') && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-gray-700">
                          {field.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> : <FileUp className="w-3.5 h-3.5 text-indigo-600" />}
                          <span>{t('maxSizeLabel')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 5, 10, 20].map((mb) => (
                            <button
                              key={mb}
                              type="button"
                              onClick={() => {
                                const updated = [...fields];
                                updated[fIdx].maxSizeMB = mb;
                                setFields(updated);
                              }}
                              className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                                (field.maxSizeMB || 5) === mb
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {mb}MB
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* অপশন তালিকা (রেডিও, চেকবক্স, ড্রপডাউন) */}
                    {field.options && (
                      <div className="pl-2 space-y-2 border-l-2 border-indigo-100">
                        {field.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">•</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const updated = [...fields];
                                updated[fIdx].options![oIdx] = e.target.value;
                                setFields(updated);
                              }}
                              className="text-xs text-gray-700 border-b border-gray-200 focus:border-indigo-600 outline-none flex-1 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteOption(fIdx, oIdx)}
                              className="text-gray-400 hover:text-red-600 p-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddOption(fIdx)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-1 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{t('addOption')}</span>
                        </button>
                      </div>
                    )}

                    {/* একক ফিল্ডের কাস্টম ডিজাইন ও কালার কন্ট্রোল প্যানেল */}
                    {designFieldId === field.id && (
                      <div className="p-4 bg-slate-50 border border-indigo-100 rounded-xl space-y-3 animate-fade-in text-xs">
                        <div className="flex items-center justify-between font-bold text-gray-800">
                          <span className="flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5 text-indigo-600" />
                            {t('fieldCustomDesign')}
                          </span>
                          {field.customColor && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...fields];
                                updated[fIdx].customColor = undefined;
                                setFields(updated);
                              }}
                              className="text-[10px] text-gray-500 hover:text-red-600 underline"
                            >
                              {lang === 'bn' ? 'ডিফল্ট থিম কালার' : 'Reset to Theme'}
                            </button>
                          )}
                        </div>

                        {/* কালার প্যালেট নির্বাচন */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-gray-600">{t('fieldCustomColor')}</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {['#4F46E5', '#2563EB', '#0D9488', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#1E293B'].map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                onClick={() => {
                                  const updated = [...fields];
                                  updated[fIdx].customColor = hex;
                                  setFields(updated);
                                }}
                                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                                  field.customColor === hex ? 'border-gray-900 scale-110 ring-2 ring-indigo-300' : 'border-white shadow-xs'
                                }`}
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                            <label className="flex items-center gap-1 cursor-pointer pl-1">
                              <input
                                type="color"
                                value={field.customColor || settings.themeColor}
                                onChange={(e) => {
                                  const updated = [...fields];
                                  updated[fIdx].customColor = e.target.value;
                                  setFields(updated);
                                }}
                                className="w-6 h-6 rounded border border-gray-300 cursor-pointer p-0"
                              />
                              <span className="text-[10px] text-gray-500 font-mono">{field.customColor || 'Auto'}</span>
                            </label>
                          </div>
                        </div>

                        {/* কার্ড ব্যাকগ্রাউন্ড ডিজাইন */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-gray-600">{t('fieldCardStyleLabel')}</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {[
                              { id: 'default', label: t('styleDefault') },
                              { id: 'subtle', label: t('styleSubtle') },
                              { id: 'highlight', label: t('styleHighlight') },
                              { id: 'glass', label: t('styleGlass') },
                            ].map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  const updated = [...fields];
                                  updated[fIdx].fieldCardStyle = st.id as any;
                                  setFields(updated);
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                                  (field.fieldCardStyle || 'default') === st.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ফুটার কন্ট্রোলস */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              const updated = [...fields];
                              updated[fIdx].required = e.target.checked;
                              setFields(updated);
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span>{t('fieldRequired')}</span>
                        </label>

                        {/* কাস্টম কালার ও ডিজাইন বাটন */}
                        <button
                          type="button"
                          onClick={() => setDesignFieldId(designFieldId === field.id ? null : field.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                            designFieldId === field.id || field.customColor || (field.fieldCardStyle && field.fieldCardStyle !== 'default')
                              ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                          }`}
                          title={t('fieldCustomDesign')}
                        >
                          <Palette className="w-3.5 h-3.5" />
                          <span>{t('fieldCustomDesign')}</span>
                          {field.customColor && (
                            <span className="w-2 h-2 rounded-full ring-1 ring-white" style={{ backgroundColor: field.customColor }} />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteField(fIdx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('deleteField')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ফিল্ড যোগ করার কুইক বার */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {t('addQuestionTitle')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddField('text')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg text-xs font-semibold transition"
                >
                  + {t('fieldShortText')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('paragraph')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg text-xs font-semibold transition"
                >
                  + {t('fieldParagraph')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('radio')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg text-xs font-semibold transition"
                >
                  + {t('fieldRadio')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('checkbox')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg text-xs font-semibold transition"
                >
                  + {t('fieldCheckbox')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('dropdown')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg text-xs font-semibold transition"
                >
                  + {t('fieldDropdown')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('number')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg text-xs font-semibold transition"
                >
                  + {t('fieldNumber')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('email')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg text-xs font-semibold transition"
                >
                  + {t('fieldEmail')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('date')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 rounded-lg text-xs font-semibold transition"
                >
                  + {t('fieldDate')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('image')}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>+ {t('fieldImage')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField('file')}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <FileUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span>+ {t('fieldFile')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ২. থিম ও ডিজাইন কাস্টমাইজার ট্যাব */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <ThemeCustomizer settings={settings} onChange={(newSettings) => setSettings(newSettings)} />
          </div>
        )}

        {/* ৩. লাইভ ক্যানভাস প্রিভিউ ট্যাব */}
        {activeTab === 'preview' && (
          <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="bg-gray-800 text-gray-200 px-4 py-2 text-xs flex items-center justify-between">
              <span>{t('previewBannerNote')}</span>
              <span className="font-semibold text-emerald-400">{t('livePreviewBadge')}</span>
            </div>
            <FormRenderer
              title={title}
              description={description}
              fields={fields}
              settings={settings}
              previewMode={true}
            />
          </div>
        )}
      </div>

      {/* শেয়ার মডাল */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        formId={id as string}
        formTitle={title}
      />
    </div>
  );
}
