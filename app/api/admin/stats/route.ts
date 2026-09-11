// app/api/admin/stats/route.ts
// অ্যাডমিন ড্যাশবোর্ডের সিস্টেম অ্যানালিটিক্স ও সামগ্রিক পরিসংখ্যান API

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'শুধুমাত্র অ্যাডমিনদের প্রবেশাধিকার রয়েছে' }, { status: 403 });
    }

    const db = await getDatabase();

    const [
      totalUsers,
      totalAdmins,
      totalEditors,
      activeUsers,
      suspendedUsers,
      totalForms,
      totalResponses,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('users').countDocuments({ role: 'admin' }),
      db.collection('users').countDocuments({ $or: [{ role: 'editor' }, { role: { $exists: false } }] }),
      db.collection('users').countDocuments({ $or: [{ status: 'active' }, { status: { $exists: false } }] }),
      db.collection('users').countDocuments({ status: 'suspended' }),
      db.collection('forms').countDocuments(),
      db.collection('responses').countDocuments(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalAdmins,
      totalEditors,
      activeUsers,
      suspendedUsers,
      totalForms,
      totalResponses,
    });
  } catch (error) {
    console.error('অ্যাডমিন স্ট্যাটস ফেচ এরর:', error);
    return NextResponse.json({ error: 'সার্ভার সমস্যা' }, { status: 500 });
  }
}
