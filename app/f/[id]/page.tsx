'use client';
// app/f/[id]/page.tsx
// সাধারণ উত্তরদাতাদের জন্য পাবলিক ফর্ম সাবমিশন পেজ (ভাষা টগল ও গ্রিড লেআউট সমর্থন)

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FormRenderer from '@/components/FormRenderer';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PublicFormPage() {
  const { id } = useParams();
  const { lang, t } = useLanguage();

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // পাবলিক ফর্ম ডেটা লোড করা
  useEffect(() => {
    async function loadPublicForm() {
      try {
        const res = await fetch(`/api/forms/${id}/public`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || t('formNotFoundOrClosed'));
        }
        const data = await res.json();
        setForm(data);
      } catch (err: any) {
        setErrorMsg(err.message || t('formNotFoundOrClosed'));
      } finally {
        setLoading(false);
      }
    }
    loadPublicForm();
  }, [id, lang]);

  // রেসপন্স সাবমিশন হ্যান্ডলার
  const handleSubmitResponse = async (answers: Record<string, any>) => {
    try {
      const res = await fetch(`/api/forms/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || t('submissionFailed'),
        };
      }
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: t('networkError'),
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 font-medium">
            {t('loadingForm')}
          </span>
        </div>
      </div>
    );
  }

  if (errorMsg || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {t('couldNotLoadForm')}
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FormRenderer
        title={form.title}
        description={form.description}
        fields={form.fields || []}
        settings={
          form.settings || {
            themeColor: '#4F46E5',
            backgroundTheme: 'mesh',
            cardStyle: 'glassmorphic',
            buttonText: t('submitBtnDefault'),
          }
        }
        onSubmit={handleSubmitResponse}
        previewMode={false}
      />
    </div>
  );
}
