'use client';
// app/forms/[id]/responses/page.tsx
// সংগৃহীত তথ্যের আকর্ষণীয় প্রিভিউ টেবিল এবং এক ক্লিকে Excel (.xlsx) এক্সপোর্ট পেজ (ভাষা টগল সহ)

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ShareModal from '@/components/ShareModal';
import { useLanguage, localizeFormText } from '@/context/LanguageContext';
import {
  FileSpreadsheet,
  ArrowLeft,
  Users,
  Eye,
  CheckCircle,
  Clock,
  Search,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Printer,
  Share2,
  Loader2,
} from 'lucide-react';

export default function ResponsesPage() {
  const { id } = useParams();
  const { lang, t } = useLanguage();

  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/forms/${id}/responses-list`);
        if (res.ok) {
          const data = await res.json();
          setForm(data.form);
          setResponses(data.responses || []);
        }
      } catch (err) {
        console.error('Failed to load responses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // সার্চ ফিল্টারিং
  const filteredResponses = responses.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(r.answers || {}).some((val: any) =>
      String(val).toLowerCase().includes(term)
    );
  });

  // সম্পূর্ণ রেসপন্স ডেটা PDF এ রূপান্তর ও সরাসরি ডাউনলোড
  const handleDownloadPDF = async () => {
    if (responses.length === 0) {
      alert(lang === 'bn' ? 'ডাউনলোড করার জন্য কোনো রেসপন্স ডেটা নেই।' : 'No responses data to download.');
      return;
    }

    setGeneratingPdf(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('printable-responses-report');
      if (!element) return;

      element.style.display = 'block';

      const opt: any = {
        margin: 8,
        filename: `${(form?.title || 'Form').replace(/[/\\?%*:|"<>]/g, '_')}_Responses.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      };

      await (html2pdf() as any).set(opt).from(element).save();
      element.style.display = 'none';
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setGeneratingPdf(false);
    }
  };

  // একক রেসপন্স PDF ডাউনলোড / প্রিন্ট
  const handlePrintSingleResponse = async () => {
    if (!selectedResponse) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('printable-single-response');
      if (!element) return;

      element.style.display = 'block';

      const opt: any = {
        margin: 10,
        filename: `${(form?.title || 'Form').replace(/[/\\?%*:|"<>]/g, '_')}_Response_${selectedResponse._id?.substring(18) || 'detail'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await (html2pdf() as any).set(opt).from(element).save();
      element.style.display = 'none';
    } catch (err) {
      console.error('Single response PDF error:', err);
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-500">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formTitle = localizeFormText(form?.title, lang) || t('responsesTitle');

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* টপ হেডার ও অ্যাকশন বার */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/forms/${id}/edit`}
                className="p-1 text-gray-400 hover:text-gray-700 rounded transition"
                title="Back to Editor"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {formTitle}
              </h1>
            </div>
            <p className="text-xs text-gray-500 pl-6">
              {t('totalSubmissions')} <span className="font-bold text-indigo-600">{responses.length}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/forms/${id}/edit`}
              className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
            >
              {t('editAction')}
            </Link>

            {/* শেয়ার বাটন */}
            <button
              onClick={() => setShowShareModal(true)}
              className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('shareBtn')}</span>
            </button>

            {/* সরাসরি এক্সেল ডাউনলোড বাটন (ভাষা অনুযায়ী) */}
            <a
              href={`/api/forms/${id}/export?lang=${lang}`}
              download
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.99] transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('downloadExcel')}</span>
            </a>

            {/* সরাসরি PDF ডাউনলোড বাটন */}
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPdf}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 active:scale-[0.99] transition flex items-center gap-2 disabled:opacity-50"
            >
              {generatingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>{generatingPdf ? t('generatingPdf') : t('downloadPdf')}</span>
            </button>
          </div>
        </div>

        {/* পরিসংখ্যান কার্ড */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">{t('totalResponses')}</p>
              <p className="text-xl font-extrabold text-gray-900">{responses.length}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">{t('statusLabel')}</p>
              <p className="text-xl font-extrabold text-emerald-600">{t('statusActive')}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">{t('latestSubmission')}</p>
              <p className="text-xs font-bold text-gray-700">
                {responses.length > 0
                  ? new Date(responses[0].submittedAt).toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US')
                  : t('noSubmissionYet')}
              </p>
            </div>
          </div>
        </div>

        {/* সার্চ বক্স */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white rounded-xl border border-gray-200 outline-none focus:border-indigo-600 transition"
            />
          </div>
        </div>

        {/* রেসপন্স টেবিল প্রিভিউ */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredResponses.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-700">{t('noResponsesYet')}</p>
              <p className="text-xs text-gray-400">{t('sharePrompt')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-slate-50 border-b border-gray-100 text-gray-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4 min-w-[150px]">{t('colSubmittedAt')}</th>
                    {form?.fields?.map((f: any) => (
                      <th key={f.id} className="p-4 min-w-[160px]">
                        {localizeFormText(f.label, lang)}
                      </th>
                    ))}
                    <th className="p-4 text-right">{t('colDetails')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResponses.map((r, idx) => (
                    <tr key={r._id} className="hover:bg-indigo-50/30 transition group">
                      <td className="p-4 text-center font-bold text-gray-400">{idx + 1}</td>
                      <td className="p-4 text-gray-500 font-mono text-[11px]">
                        {new Date(r.submittedAt).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      {form?.fields?.map((f: any) => {
                        const answer = r.answers?.[f.id];
                        if (!answer && answer !== 0) {
                          return (
                            <td key={f.id} className="p-4 font-medium text-gray-300 italic">
                              —
                            </td>
                          );
                        }

                        if (f.type === 'image') {
                          return (
                            <td key={f.id} className="p-4 font-medium">
                              <a
                                href={String(answer)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 group"
                              >
                                <img
                                  src={String(answer)}
                                  alt="Attachment"
                                  className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-xs group-hover:scale-105 transition-transform"
                                />
                                <span className="text-[11px] text-indigo-600 group-hover:underline flex items-center gap-0.5 font-semibold">
                                  <ExternalLink className="w-3 h-3" />
                                  {t('viewImage')}
                                </span>
                              </a>
                            </td>
                          );
                        }

                        if (f.type === 'file') {
                          return (
                            <td key={f.id} className="p-4 font-medium">
                              <a
                                href={String(answer)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-indigo-600 rounded-lg text-xs font-semibold transition"
                              >
                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="truncate max-w-[120px]">{String(answer).split('/').pop()}</span>
                                <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                              </a>
                            </td>
                          );
                        }

                        let displayVal = '—';
                        if (Array.isArray(answer)) {
                          displayVal = answer.map((a) => localizeFormText(a, lang)).join(', ');
                        } else {
                          displayVal = localizeFormText(String(answer), lang);
                        }

                        return (
                          <td key={f.id} className="p-4 font-medium text-gray-800">
                            {displayVal}
                          </td>
                        );
                      })}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedResponse(r)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* একক রেসপন্স বিস্তারিত দেখার মডাল */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">{t('modalTitle')}</h3>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-[11px] text-gray-400">
              {t('modalSubmittedOn')} {new Date(selectedResponse.submittedAt).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {form?.fields?.map((field: any) => {
                const answer = selectedResponse.answers?.[field.id];

                return (
                  <div key={field.id} className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <span className="text-xs font-bold text-gray-700">{localizeFormText(field.label, lang)}</span>
                    {!answer && answer !== 0 ? (
                      <p className="text-xs text-gray-400 italic">—</p>
                    ) : field.type === 'image' ? (
                      <div className="pt-1 space-y-2">
                        <img
                          src={String(answer)}
                          alt="Response attachment"
                          className="max-h-48 rounded-xl object-contain border border-gray-200 bg-white"
                        />
                        <div>
                          <a
                            href={String(answer)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-600 hover:underline font-semibold inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {t('viewImage')}
                          </a>
                        </div>
                      </div>
                    ) : field.type === 'file' ? (
                      <div className="pt-1">
                        <a
                          href={String(answer)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-300 text-indigo-600 rounded-lg text-xs font-semibold shadow-xs transition"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="truncate max-w-xs">{String(answer).split('/').pop()}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-900 font-medium">
                        {Array.isArray(answer)
                          ? answer.map((a) => localizeFormText(a, lang)).join(', ')
                          : localizeFormText(String(answer), lang)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrintSingleResponse}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('printPdf')}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition"
              >
                {t('closeModal')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* সম্পূর্ণ রেসপন্স ডেটার প্রিন্ট ও PDF টেমপ্লেট (ডাউনলোডের সময় সক্রিয় হয়) */}
      <div
        id="printable-responses-report"
        style={{ display: 'none' }}
        className="p-8 bg-white text-gray-900 font-sans"
      >
        <div className="border-b-2 border-indigo-600 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{formTitle}</h1>
            <p className="text-xs text-gray-500 mt-1">{t('pdfSummaryReport')}</p>
          </div>
          <div className="text-right text-xs text-gray-500 space-y-0.5">
            <p>
              <span className="font-bold text-gray-700">{t('pdfTotalResponses')}</span> {responses.length}
            </p>
            <p>
              <span className="font-bold text-gray-700">{t('pdfGeneratedOn')}</span>{' '}
              {new Date().toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
            </p>
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse border border-gray-300">
          <thead>
            <tr className="bg-slate-100 text-gray-800 font-bold border-b border-gray-300">
              <th className="p-2 border border-gray-300 w-10 text-center">#</th>
              <th className="p-2 border border-gray-300 min-w-[120px]">{t('colSubmittedAt')}</th>
              {form?.fields?.map((f: any) => (
                <th key={f.id} className="p-2 border border-gray-300">
                  {localizeFormText(f.label, lang)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((r, idx) => (
              <tr key={r._id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="p-2 border border-gray-300 text-center font-bold text-gray-500">{idx + 1}</td>
                <td className="p-2 border border-gray-300 font-mono text-[10px]">
                  {new Date(r.submittedAt).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                </td>
                {form?.fields?.map((f: any) => {
                  const answer = r.answers?.[f.id];
                  if (!answer && answer !== 0) {
                    return (
                      <td key={f.id} className="p-2 border border-gray-300 text-gray-400 italic">
                        —
                      </td>
                    );
                  }
                  if (f.type === 'image') {
                    return (
                      <td key={f.id} className="p-2 border border-gray-300">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={String(answer)}
                            alt="img"
                            className="w-8 h-8 object-cover rounded border border-gray-300"
                          />
                          <span className="text-[10px] text-indigo-600 truncate max-w-[120px]">
                            {String(answer)}
                          </span>
                        </div>
                      </td>
                    );
                  }
                  if (f.type === 'file') {
                    return (
                      <td key={f.id} className="p-2 border border-gray-300 text-[10px] text-indigo-600 font-mono">
                        {String(answer).split('/').pop()}
                      </td>
                    );
                  }
                  return (
                    <td key={f.id} className="p-2 border border-gray-300 font-medium">
                      {Array.isArray(answer)
                        ? answer.map((a) => localizeFormText(a, lang)).join(', ')
                        : localizeFormText(String(answer), lang)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* একক রেসপন্সের প্রিন্ট ও PDF টেমপ্লেট */}
      {selectedResponse && (
        <div
          id="printable-single-response"
          style={{ display: 'none' }}
          className="p-8 bg-white text-gray-900 font-sans"
        >
          <div className="border-b-2 border-indigo-600 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-gray-900">{formTitle}</h1>
              <p className="text-xs text-gray-500 mt-1">{t('modalTitle')}</p>
            </div>
            <div className="text-right text-xs text-gray-500 space-y-0.5">
              <p>
                <span className="font-bold text-gray-700">{t('modalSubmittedOn')}</span>{' '}
                {new Date(selectedResponse.submittedAt).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
              </p>
              <p>
                <span className="font-bold text-gray-700">ID:</span> {selectedResponse._id}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {form?.fields?.map((field: any, idx: number) => {
              const answer = selectedResponse.answers?.[field.id];
              return (
                <div key={field.id} className="p-3.5 border border-gray-200 rounded-xl bg-slate-50/50">
                  <p className="text-xs font-bold text-gray-700 mb-1">
                    #{idx + 1}. {localizeFormText(field.label, lang)}
                  </p>
                  {!answer && answer !== 0 ? (
                    <p className="text-xs text-gray-400 italic">—</p>
                  ) : field.type === 'image' ? (
                    <div className="space-y-1 pt-1">
                      <img
                        src={String(answer)}
                        alt="Attachment"
                        className="max-h-56 object-contain rounded-lg border border-gray-300"
                      />
                      <p className="text-[10px] text-indigo-600 font-mono break-all">{String(answer)}</p>
                    </div>
                  ) : field.type === 'file' ? (
                    <p className="text-xs font-semibold text-indigo-600 font-mono">{String(answer)}</p>
                  ) : (
                    <p className="text-xs text-gray-900 font-medium">
                      {Array.isArray(answer)
                        ? answer.map((a) => localizeFormText(a, lang)).join(', ')
                        : localizeFormText(String(answer), lang)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* সোশ্যাল ও ডিরেক্ট শেয়ার মডাল */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        formId={id as string}
        formTitle={formTitle}
      />
    </div>
  );
}
