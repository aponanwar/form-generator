'use client';
// app/dashboard/page.tsx
// ব্যবহারকারীর মূল ড্যাশবোর্ড: সকল ফর্ম তালিকা, অ্যানালিটিক্স এবং অ্যাকশন কন্ট্রোলস (ভাষা টগল সমর্থন সহ)

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShareModal from '@/components/ShareModal';
import { useLanguage, localizeFormText } from '@/context/LanguageContext';
import {
  Plus,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Share2,
  BarChart3,
  Check,
  FileText,
  ShieldCheck,
  Crown,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [shareModalForm, setShareModalForm] = useState<{ id: string; title: string } | null>(null);

  // ইউজার সাইন-ইন না থাকলে রিডাইরেক্ট
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // ফর্মের তালিকা লোড করা
  const fetchForms = async () => {
    try {
      const res = await fetch('/api/forms');
      if (res.ok) {
        const data = await res.json();
        setForms(data.forms || []);
      }
    } catch (err) {
      console.error('Failed to fetch forms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchForms();
    }
  }, [session]);

  // নতুন ফর্ম তৈরি করার ফাংশন
  const handleCreateNew = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lang === 'bn' ? 'নতুন আকর্ষণীয় ফর্ম' : 'New Interactive Form',
          description:
            lang === 'bn'
              ? 'এই ফর্মটিতে আপনার মতামত ও তথ্য প্রদান করুন।'
              : 'Please provide your valuable feedback and information through this form.',
        }),
      });

      const data = await res.json();
      if (res.ok && data.formId) {
        router.push(`/forms/${data.formId}/edit`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // ফর্ম ডিলিট করা
  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setForms(forms.filter((f) => f._id !== id));
      }
    } catch (err) {
      alert('Failed to delete form');
    }
  };

  // পাবলিক লিংক কপি করা
  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/f/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // মোট রেসপন্স সংখ্যা হিসাব
  const totalResponses = forms.reduce((acc, f) => acc + (f.responseCount || 0), 0);

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ড্যাশবোর্ড হেডার ও পরিসংখ্যান */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {t('dashTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t('dashSubtitle')}
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            disabled={creating}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 active:scale-[0.99] transition flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? t('creatingForm') : t('createNewForm')}</span>
          </button>
        </div>

        {/* অ্যাডমিন প্রিভিলেজ ব্যানার (যদি ব্যবহারকারী অ্যাডমিন হন) */}
        {((session?.user as any)?.role === 'admin') && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900">
                    {lang === 'bn' ? 'অ্যাডমিন প্রিভিলেজ সক্রিয়' : 'Admin Privileges Active'}
                  </span>
                  <span className="text-[10px] bg-amber-200/70 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                    ADMIN
                  </span>
                </div>
                <p className="text-xs text-amber-700/80 mt-0.5">
                  {lang === 'bn'
                    ? 'সিস্টেমের সমস্ত ব্যবহারকারী ও ফর্ম নিয়ন্ত্রণ করতে অ্যাডমিন কন্ট্রোল সেন্টারে যান।'
                    : 'Access the full control center to manage all users, permissions, and forms.'}
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition shrink-0 self-start sm:self-auto"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{t('adminPanelLink')}</span>
            </Link>
          </div>
        )}

        {/* পরিসংখ্যান কার্ড */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">{t('totalForms')}</p>
              <p className="text-2xl font-black text-gray-900">{forms.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">{t('totalResponses')}</p>
              <p className="text-2xl font-black text-gray-900">{totalResponses}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">{t('excelSupported')}</p>
              <p className="text-sm font-bold text-gray-700">{t('realtime')}</p>
            </div>
          </div>
        </div>

        {/* ফর্মের তালিকা */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>{t('createdForms')}</span>
            <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
              {forms.length}
            </span>
          </h2>

          {forms.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-800">{t('noFormsTitle')}</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {t('noFormsDesc')}
              </p>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700 transition"
              >
                {t('startNow')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <div
                  key={form._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* কার্ডের উপরের অংশ */}
                  <div>
                    <div
                      className="h-2 w-full"
                      style={{ backgroundColor: form.settings?.themeColor || '#4F46E5' }}
                    />

                    <div className="p-6 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-base text-gray-900 group-hover:text-indigo-600 transition line-clamp-1">
                          {localizeFormText(form.title, lang) || t('untitledForm')}
                        </h3>
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          {form.responseCount || 0} {t('responsesCount')}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {localizeFormText(form.description, lang) || t('noDescription')}
                      </p>

                      <div className="text-[11px] text-gray-400">
                        {t('createdOn')}:{' '}
                        {new Date(form.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* কার্ডের নিচের অ্যাকশন বাটনসমূহ */}
                  <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/forms/${form._id}/edit`}
                        title={t('editAction')}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('editAction')}</span>
                      </Link>

                      <Link
                        href={`/forms/${form._id}/responses`}
                        title={t('responsesAction')}
                        className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('responsesAction')}</span>
                      </Link>

                      <a
                        href={`/api/forms/${form._id}/export`}
                        download
                        title={t('exportExcelAction')}
                        className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setShareModalForm({ id: form._id, title: form.title })}
                        title={t('shareLink')}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(form._id)}
                        title="Delete Form"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* সোশ্যাল ও ডিরেক্ট শেয়ার মডাল */}
      <ShareModal
        isOpen={Boolean(shareModalForm)}
        onClose={() => setShareModalForm(null)}
        formId={shareModalForm?.id || ''}
        formTitle={shareModalForm?.title || ''}
      />
    </div>
  );
}
