// app/api/admin/users/route.ts
// অ্যাডমিন কর্তৃক ব্যবহারকারীদের তালিকা দেখা এবং সরাসরি নতুন ব্যবহারকারী তৈরির API

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';

// ১. সকল ব্যবহারকারীর তালিকা এবং তাদের কার্যক্রমের তথ্য লোড করা
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'শুধুমাত্র অ্যাডমিনদের প্রবেশাধিকার রয়েছে' }, { status: 403 });
    }

    const db = await getDatabase();

    // ব্যবহারকারীদের তালিকা আনা
    const users = await db
      .collection('users')
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    // প্রতিটি ইউজারের ফর্ম সংখ্যা হিসেব করা
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const formsCount = await db.collection('forms').countDocuments({ userId: u._id.toString() });
        return {
          _id: u._id.toString(),
          name: u.name || 'Unknown User',
          email: u.email,
          role: u.role || 'editor',
          status: u.status || 'active',
          image: u.image || null,
          createdAt: u.createdAt || new Date(),
          formsCount,
        };
      })
    );

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error('অ্যাডমিন ইউজার ফেচ এরর:', error);
    return NextResponse.json({ error: 'সার্ভার সমস্যা' }, { status: 500 });
  }
}

// ২. অ্যাডমিন কর্তৃক সরাসরি নতুন ইউজার যুক্ত করা
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'নাম, ইমেইল এবং পাসওয়ার্ড প্রদান করুন' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedName = sanitizeInput(name);
    const assignedRole = role === 'admin' ? 'admin' : 'editor';

    const db = await getDatabase();
    const existing = await db.collection('users').findOne({ email: sanitizedEmail });
    if (existing) {
      return NextResponse.json({ error: 'এই ইমেইলে ইতিপূর্বে অ্যাকাউন্ট রয়েছে' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await db.collection('users').insertOne({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: assignedRole,
      status: 'active',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      userId: result.insertedId,
      message: 'ব্যবহারকারী সফলভাবে যুক্ত হয়েছে!',
    });
  } catch (error) {
    console.error('ইউজার তৈরি এরর:', error);
    return NextResponse.json({ error: 'ব্যবহারকারী তৈরি করা সম্ভব হয়নি' }, { status: 500 });
  }
}
