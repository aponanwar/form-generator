'use client';
// app/admin/page.tsx
// অ্যাডমিন কন্ট্রোল সেন্টার: ব্যবহারকারী নিয়ন্ত্রণ, রোল পরিবর্তন, সাসপেন্ড এবং সমগ্র ফর্ম পর্যবেক্ষণ

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  ShieldCheck,
  Users,
  FileText,
  MessageSquare,
  UserCheck,
  UserX,
  Search,
  Filter,
  Trash2,
  Crown,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Plus,
  ExternalLink,
  Edit3,
  BarChart3,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';

export default function AdminPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'users' | 'forms'>('users');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // অ্যানালিটিক্স স্ট্যাটস
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalEditors: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalForms: 0,
    totalResponses: 0,
  });

  // ইউজার তালিকা ও ফিল্টারিং
  const [users, setUsers] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'editor'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  // সিস্টেম ফর্ম তালিকা ও ফিল্টারিং
  const [forms, setForms] = useState<any[]>([]);
  const [searchForm, setSearchForm] = useState('');

  // মডাল স্টেট
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [creatingUser, setCreatingUser] = useState(false);

  const [deleteUserTarget, setDeleteUserTarget] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const [deleteFormTarget, setDeleteFormTarget] = useState<any | null>(null);
  const [deletingForm, setDeletingForm] = useState(false);

  const userRole = ((session?.user as any)?.role || 'editor') as 'admin' | 'editor';
  const isAdmin = userRole === 'admin';

  // টোস্ট নোটিফিকেশন প্রদর্শন
  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ডেটা লোড করার মূল ফাংশন
  const loadAdminData = async () => {
    if (!isAdmin) return;
    setRefreshing(true);
    try {
      const [statsRes, usersRes, formsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/forms'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
      if (formsRes.ok) {
        const formsData = await formsRes.json();
        setForms(formsData.forms || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      notify('error', lang === 'bn' ? 'তথ্য লোড করতে ব্যর্থ হয়েছে' : 'Failed to fetch admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && isAdmin) {
      loadAdminData();
    } else if (status === 'authenticated' && !isAdmin) {
      setLoading(false);
    }
  }, [status, isAdmin]);

  // ইউজার রোল পরিবর্তন
  const handleUpdateRole = async (userId: string, targetRole: 'admin' | 'editor') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (res.ok) {
        notify('success', lang === 'bn' ? 'ইউজার রোল সফলভাবে আপডেট হয়েছে!' : 'User role updated successfully!');
        // যদি কারেন্ট ইউজারের রোল পরিবর্তন করা হয়
        if (userId === (session?.user as any)?.id) {
          await update({ role: targetRole });
        }
        loadAdminData();
      } else {
        notify('error', data.error || 'Failed to update role');
      }
    } catch (err) {
      notify('error', 'Error updating role');
    }
  };

  // ইউজার স্ট্যাটাস পরিবর্তন (অ্যাক্টিভ <-> সাসপেন্ড)
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const targetStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        notify(
          'success',
          targetStatus === 'suspended'
            ? lang === 'bn' ? 'ব্যবহারকারী স্থগিত করা হয়েছে!' : 'User suspended!'
            : lang === 'bn' ? 'ব্যবহারকারী পুনরায় সক্রিয় করা হয়েছে!' : 'User activated!'
        );
        loadAdminData();
      } else {
        notify('error', data.error || 'Failed to update status');
      }
    } catch (err) {
      notify('error', 'Error updating status');
    }
  };

  // নতুন ইউজার তৈরি
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    setCreatingUser(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok) {
        notify('success', lang === 'bn' ? 'নতুন ব্যবহারকারী তৈরি সম্পন্ন!' : 'New user created successfully!');
        setIsAddUserOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'editor' });
        loadAdminData();
      } else {
        notify('error', data.error || 'Failed to create user');
      }
    } catch (err) {
      notify('error', 'Error creating user');
    } finally {
      setCreatingUser(false);
    }
  };

  // ইউজার মুছে ফেলা
  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return;
    setDeletingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUserTarget._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        notify('success', lang === 'bn' ? 'ব্যবহারকারী ডিলিট করা হয়েছে!' : 'User deleted successfully!');
        setDeleteUserTarget(null);
        loadAdminData();
      } else {
        notify('error', data.error || 'Failed to delete user');
      }
    } catch (err) {
      notify('error', 'Error deleting user');
    } finally {
      setDeletingUser(false);
    }
  };

  // ফর্ম মুছে ফেলা
  const handleDeleteForm = async () => {
    if (!deleteFormTarget) return;
    setDeletingForm(true);
    try {
      const res = await fetch(`/api/forms/${deleteFormTarget._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        notify('success', lang === 'bn' ? 'ফর্মটি মুছে ফেলা হয়েছে!' : 'Form deleted successfully!');
        setDeleteFormTarget(null);
        loadAdminData();
      } else {
        notify('error', data.error || 'Failed to delete form');
      }
    } catch (err) {
      notify('error', 'Error deleting form');
    } finally {
      setDeletingForm(false);
    }
  };

  // অ্যাডমিন নয় এমন ব্যবহারকারীর জন্য রেস্ট্রিকশন স্ক্রিন
  if (status !== 'loading' && !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">{t('accessDeniedTitle')}</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{t('accessDeniedDesc')}</p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={async () => {
                await fetch('/api/user/role', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ role: 'admin' }),
                });
                await update({ role: 'admin' });
                router.refresh();
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow transition"
            >
              <Crown className="w-4 h-4" />
              <span>{t('switchToAdmin')}</span>
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 text-xs font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              <span>{t('returnHomeBtn')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ফিল্টার করা ব্যবহারকারী
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // ফিল্টার করা ফর্ম
  const filteredForms = forms.filter((f) => {
    return (
      (f.title || '').toLowerCase().includes(searchForm.toLowerCase()) ||
      (f.creatorName || '').toLowerCase().includes(searchForm.toLowerCase()) ||
      (f.creatorEmail || '').toLowerCase().includes(searchForm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* নোটিফিকেশন টোস্ট */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold animate-in slide-in-from-bottom-5 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* হেডার ব্যানার */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{t('adminPortalTitle')}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-extrabold tracking-wider border border-amber-400/30 uppercase">
                  {t('roleBadgeAdmin')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">{t('adminPortalSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadAdminData}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-sm border border-white/10 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? t('checking') : 'Refresh'}</span>
            </button>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewUserBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* অ্যানালিটিক্স মেট্রিক কার্ডস */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {/* কার্ড ১: মোট ব্যবহারকারী */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">{t('statTotalUsers')}</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {stats.totalUsers}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-slate-500">
              <span className="text-amber-600 font-bold">{stats.totalAdmins} {t('statAdmins')}</span>
              <span>•</span>
              <span className="text-indigo-600 font-bold">{stats.totalEditors} {t('statEditors')}</span>
            </div>
          </div>

          {/* কার্ড ২: সক্রিয় অ্যাকাউন্ট */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">{t('statActiveUsers')}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {stats.activeUsers}
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              {stats.suspendedUsers > 0 ? (
                <span className="text-red-600 font-bold">{stats.suspendedUsers} {t('statSuspendedUsers')}</span>
              ) : (
                <span className="text-emerald-600 font-semibold">100% Active</span>
              )}
            </div>
          </div>

          {/* কার্ড ৩: মোট ফর্ম */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">{t('statTotalForms')}</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {stats.totalForms}
            </div>
            <div className="mt-2 text-[11px] text-purple-600 font-semibold">
              Live & Draft Forms
            </div>
          </div>

          {/* কার্ড ৪: মোট রেসপন্স */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">{t('statTotalResponses')}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {stats.totalResponses}
            </div>
            <div className="mt-2 text-[11px] text-amber-600 font-semibold">
              Recorded Submissions
            </div>
          </div>
        </div>

        {/* ট্যাব নেভিগেশন */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
                activeTab === 'users'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('tabUsers')}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('forms')}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition ${
                activeTab === 'forms'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('tabForms')}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold">
                {forms.length}
              </span>
            </button>
          </div>
        </div>

        {/* ট্যাব ১: ব্যবহারকারী নিয়ন্ত্রণ (User Management) */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* ফিল্টার ও সার্চ বার */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('searchUsersPlaceholder')}
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">{t('allRoles')}</option>
                  <option value="admin">{t('roleBadgeAdmin')}</option>
                  <option value="editor">{t('roleBadgeEditor')}</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">{t('allStatuses')}</option>
                  <option value="active">{t('activeStatus')}</option>
                  <option value="suspended">{t('suspendedStatus')}</option>
                </select>
              </div>
            </div>

            {/* ইউজার টেবিল */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">{t('colUser')}</th>
                    <th className="py-3 px-4">{t('colRole')}</th>
                    <th className="py-3 px-4">{t('colStatus')}</th>
                    <th className="py-3 px-4">{t('colFormsCreated')}</th>
                    <th className="py-3 px-4">{t('colJoinedDate')}</th>
                    <th className="py-3 px-4 text-right">{t('colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <span>Loading users...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {lang === 'bn' ? 'কোনো ব্যবহারকারী পাওয়া যায়নি' : 'No users found matching filter'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrentAdmin = u._id === (session?.user as any)?.id;
                      const isSuspended = u.status === 'suspended';
                      const isAdminRole = u.role === 'admin';

                      return (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition">
                          {/* ব্যবহারকারী তথ্য */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs overflow-hidden shrink-0">
                                {u.image ? (
                                  <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                  u.name?.[0]?.toUpperCase() || 'U'
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isCurrentAdmin && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* রোল */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                isAdminRole
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              }`}
                            >
                              {isAdminRole ? <Crown className="w-3 h-3 text-amber-600" /> : <Sliders className="w-3 h-3 text-indigo-600" />}
                              <span>{isAdminRole ? t('roleBadgeAdmin') : t('roleBadgeEditor')}</span>
                            </span>
                          </td>

                          {/* স্ট্যাটাস */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isSuspended
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSuspended ? 'bg-red-500' : 'bg-emerald-500'
                                }`}
                              />
                              <span>{isSuspended ? t('suspendedStatus') : t('activeStatus')}</span>
                            </span>
                          </td>

                          {/* ফর্ম সংখ্যা */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800">{u.formsCount || 0}</span>
                          </td>

                          {/* যুক্ত হওয়ার তারিখ */}
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>

                          {/* অ্যাডমিন অ্যাকশন বাটনসমূহ */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* রোল পরিবর্তন বাটন */}
                              <button
                                onClick={() => handleUpdateRole(u._id, isAdminRole ? 'editor' : 'admin')}
                                title={isAdminRole ? t('makeEditorAction') : t('makeAdminAction')}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              >
                                <Crown className="w-4 h-4" />
                              </button>

                              {/* সাসপেন্ড / সক্রিয় বাটন */}
                              {!isCurrentAdmin && (
                                <button
                                  onClick={() => handleToggleStatus(u._id, u.status)}
                                  title={isSuspended ? t('activateAction') : t('suspendAction')}
                                  className={`p-1.5 rounded-lg transition ${
                                    isSuspended
                                      ? 'text-emerald-600 hover:bg-emerald-50'
                                      : 'text-amber-600 hover:bg-amber-50'
                                  }`}
                                >
                                  {isSuspended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                </button>
                              )}

                              {/* ডিলিট বাটন */}
                              {!isCurrentAdmin && (
                                <button
                                  onClick={() => setDeleteUserTarget(u)}
                                  title={t('deleteUserAction')}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ট্যাব ২: সমগ্র সিস্টেমের ফর্ম তদারকি (System Forms Oversight) */}
        {activeTab === 'forms' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* সার্চ বার */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('searchFormsPlaceholder')}
                  value={searchForm}
                  onChange={(e) => setSearchForm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {filteredForms.length} {t('statTotalForms')}
              </span>
            </div>

            {/* ফর্ম টেবিল */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">{t('colFormTitle')}</th>
                    <th className="py-3 px-4">{t('colCreator')}</th>
                    <th className="py-3 px-4">{t('colFields')}</th>
                    <th className="py-3 px-4">{t('colSubmissions')}</th>
                    <th className="py-3 px-4">{t('colCreatedAt')}</th>
                    <th className="py-3 px-4 text-right">{t('colManage')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <span>Loading forms...</span>
                      </td>
                    </tr>
                  ) : filteredForms.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {lang === 'bn' ? 'কোনো ফর্ম পাওয়া যায়নি' : 'No forms found'}
                      </td>
                    </tr>
                  ) : (
                    filteredForms.map((f) => (
                      <tr key={f._id} className="hover:bg-slate-50/80 transition">
                        {/* ফর্ম শিরোনাম */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 truncate">{f.title}</div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {f.description || 'No description'}
                          </div>
                        </td>

                        {/* ক্রিয়েটর */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{f.creatorName}</div>
                          <div className="text-[11px] text-slate-400">{f.creatorEmail}</div>
                        </td>

                        {/* ফিল্ড সংখ্যা */}
                        <td className="py-3.5 px-4 font-bold text-slate-800">{f.fieldsCount}</td>

                        {/* জমা হওয়া রেসপন্স */}
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-[11px]">
                            {f.responsesCount}
                          </span>
                        </td>

                        {/* তৈরির তারিখ */}
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* অ্যাকশন বাটনসমূহ */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* প্রিভিউ / ওপেন ফর্ম */}
                            <Link
                              href={`/forms/${f._id}`}
                              target="_blank"
                              title={t('openFormAction')}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* এডিটর লিঙ্ক */}
                            <Link
                              href={`/forms/${f._id}/edit`}
                              title={t('editFormAction')}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>

                            {/* রেসপন্স লিঙ্ক */}
                            <Link
                              href={`/forms/${f._id}/responses`}
                              title={t('viewResponsesAction')}
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Link>

                            {/* ডিলিট ফর্ম */}
                            <button
                              onClick={() => setDeleteFormTarget(f)}
                              title={t('deleteFormAction')}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* মডাল ১: নতুন ব্যবহারকারী যোগ করা */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">{t('addNewUserBtn')}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'bn'
                ? 'সরাসরি ডাটাবেজে নতুন ব্যবহারকারী অ্যাকাউন্ট তৈরি করুন'
                : 'Create a new user account directly with designated role'}
            </p>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('nameLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('namePlaceholder')}
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('emailLabel')}</label>
                <input
                  type="email"
                  required
                  placeholder={t('emailPlaceholder')}
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('passwordLabel')}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('colRole')}</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="editor">{t('roleBadgeEditor')}</option>
                  <option value="admin">{t('roleBadgeAdmin')}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  {t('closeModal')}
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {creatingUser ? t('completing') : t('addNewUserBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* মডাল ২: ইউজার মুছে ফেলার কনফার্মেশন */}
      {deleteUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">{t('deleteUserAction')}</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{t('deleteUserConfirm')}</p>
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-800">
              <div>Name: {deleteUserTarget.name}</div>
              <div className="text-slate-500">Email: {deleteUserTarget.email}</div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteUserTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {t('closeModal')}
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deletingUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
              >
                {deletingUser ? 'Deleting...' : t('deleteUserAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* মডাল ৩: ফর্ম মুছে ফেলার কনফার্মেশন */}
      {deleteFormTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">{t('deleteFormAction')}</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{t('deleteFormAdminConfirm')}</p>
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-800">
              <div>Title: {deleteFormTarget.title}</div>
              <div className="text-slate-500">Creator: {deleteFormTarget.creatorEmail}</div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteFormTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {t('closeModal')}
              </button>
              <button
                type="button"
                onClick={handleDeleteForm}
                disabled={deletingForm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
              >
                {deletingForm ? 'Deleting...' : t('deleteFormAction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
