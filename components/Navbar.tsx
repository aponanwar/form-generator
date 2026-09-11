'use client';
// components/Navbar.tsx
// অ্যাপ্লিকেশনের প্রিমিয়াম গ্লাস নেভিগেশন বার ও ভাষা টগল

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Sparkles,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Plus,
  Crown,
  ShieldCheck,
  ChevronDown,
  Check,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const { data: session, status, update } = useSession();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const userRole = ((session?.user as any)?.role || 'editor') as 'admin' | 'editor';
  const isAdmin = userRole === 'admin';

  // বাইরে ক্লিক করলে রোল মেনু বন্ধ করা
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // দ্রুত নতুন ফর্ম তৈরি করে বিল্ডারে রিডাইরেক্ট
  const handleCreateFast = async () => {
    if (!session) {
      router.push('/login');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lang === 'bn' ? 'শিরোনামহীন নতুন ফর্ম' : 'Untitled Form',
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

  // রোল পরিবর্তন (অ্যাডমিন <-> এডিটর)
  const handleSwitchRole = async (targetRole: 'admin' | 'editor') => {
    if (targetRole === userRole || switchingRole) return;
    setSwitchingRole(true);
    try {
      const res = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        await update({ role: targetRole });
        setRoleMenuOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setSwitchingRole(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* লোগো ও ব্র্যান্ড নাম */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-gray-900 via-indigo-900 to-indigo-600 bg-clip-text text-transparent">
              {t('brandTitle')}
            </span>
            <span className="text-[10px] font-semibold text-indigo-600 -mt-1 tracking-wider uppercase">
              {t('brandSubtitle')}
            </span>
          </div>
        </Link>

        {/* ডানদিকের কন্ট্রোলস ও ভাষা টগল */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* ভাষা টগল বাটন (EN | বাংলা) */}
          <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/60 shadow-inner">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('bn')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'bn'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              বাং
            </button>
          </div>

          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
          ) : session ? (
            <>
              {/* ১. ইউজার রোল ব্যাজ ও ড্রপডাউন সুইচার */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setRoleMenuOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition shadow-xs ${
                    isAdmin
                      ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`}
                  title={t('roleSelectorTitle')}
                >
                  {isAdmin ? (
                    <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
                  ) : (
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span>{isAdmin ? t('roleBadgeAdmin') : t('roleBadgeEditor')}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {/* রোল ড্রপডাউন মেনু */}
                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        {t('roleSelectorTitle')}
                      </div>
                      <div className="text-xs text-gray-500 leading-tight mt-0.5">
                        {t('roleSelectorDesc')}
                      </div>
                    </div>

                    {/* অ্যাডমিন অপশন */}
                    <button
                      onClick={() => handleSwitchRole('admin')}
                      disabled={switchingRole}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        isAdmin
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Crown className={`w-4 h-4 ${isAdmin ? 'text-amber-600' : 'text-gray-400'}`} />
                        <span>{t('roleBadgeAdmin')}</span>
                      </div>
                      {isAdmin && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </button>

                    {/* এডিটর / ইউজার অপশন */}
                    <button
                      onClick={() => handleSwitchRole('editor')}
                      disabled={switchingRole}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        !isAdmin
                          ? 'bg-indigo-50 text-indigo-900 font-bold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sliders className={`w-4 h-4 ${!isAdmin ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <span>{t('roleBadgeEditor')}</span>
                      </div>
                      {!isAdmin && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>

                    {switchingRole && (
                      <div className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-gray-500 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>{t('switchingRole')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ২. অ্যাডমিন প্যানেল লিঙ্ক (শুধুমাত্র অ্যাডমিন রোল থাকলে দৃশ্যমান) */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-lg shadow-xs transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">{t('adminPanelLink')}</span>
                </Link>
              )}

              {/* ৩. নতুন ফর্ম তৈরি বাটন */}
              <button
                onClick={handleCreateFast}
                disabled={creating}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{creating ? t('creatingForm') : t('newFormBtn')}</span>
              </button>

              {/* ৪. সাধারণ ড্যাশবোর্ড লিঙ্ক */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">{t('dashboardBtn')}</span>
              </Link>

              {/* ৫. প্রোফাইল তথ্য ও লগআউট */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div
                  className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-xs overflow-hidden"
                  title={`${session.user?.name || ''} (${userRole})`}
                >
                  {session.user?.image ? (
                    <img src={session.user.image} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  title={t('logoutTooltip')}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-indigo-600 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('signInBtn')}</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                <span>{t('registerBtn')}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
