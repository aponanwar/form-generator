// app/api/user/role/route.ts
// ব্যবহারকারীকে অ্যাডমিন ও এডিটর মোডের মধ্যে দ্রুত স্যুইচ করার API (টেস্টিং ও ডেমো সহায়তায়)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'ব্যবহারকারী আইডি সঠিক নয়' }, { status: 400 });
    }

    let targetRole: 'admin' | 'editor';
    try {
      const body = await req.json();
      if (body.role === 'admin' || body.role === 'editor') {
        targetRole = body.role;
      } else {
        targetRole = (session.user as any).role === 'admin' ? 'editor' : 'admin';
      }
    } catch {
      targetRole = (session.user as any).role === 'admin' ? 'editor' : 'admin';
    }

    const userEmail = (session.user.email || '').toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const isSystemAdmin = (session.user as any).role === 'admin' || (adminEmail && userEmail === adminEmail);

    // নিরাপত্তা নীতি: সাধারণ ইউজার/এডিটর নিজে নিজে অ্যাডমিন হতে পারবে না
    if (!isSystemAdmin && targetRole === 'admin') {
      return NextResponse.json(
        { error: 'ব্যবহারকারী নিজে নিজে অ্যাডমিন হতে পারবেন না। শুধুমাত্র অ্যাডমিন অন্যকে রোল প্রদান করতে পারেন।' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: targetRole } }
    );

    return NextResponse.json({
      success: true,
      role: targetRole,
      message: targetRole === 'admin' ? 'অ্যাডমিন মোডে পরিবর্তিত হয়েছে' : 'এডিটর মোডে পরিবর্তিত হয়েছে',
    });
  } catch (error) {
    console.error('রোল পরিবর্তন এরর:', error);
    return NextResponse.json({ error: 'রোল পরিবর্তন করা সম্ভব হয়নি' }, { status: 500 });
  }
}
