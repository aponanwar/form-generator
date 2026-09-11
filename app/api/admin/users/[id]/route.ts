// app/api/admin/users/[id]/route.ts
// অ্যাডমিন কর্তৃক নির্দিষ্ট ব্যবহারকারীর রোল পরিবর্তন, সাসপেন্ড ও ডিলিট করার API

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

// ১. ব্যবহারকারীর রোল বা স্ট্যাটাস আপডেট করা
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'শুধুমাত্র অ্যাডমিনদের প্রবেশাধিকার রয়েছে' }, { status: 403 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'অকার্যকর ব্যবহারকারী আইডি' }, { status: 400 });
    }

    const body = await req.json();
    const { role, status, name } = body;

    const currentAdminId = (session.user as any).id;
    const db = await getDatabase();

    // সেফগার্ড: নিজেকে সাসপেন্ড বা ডিমোট করার চেষ্টা রোধ
    if (id === currentAdminId) {
      if (status === 'suspended') {
        return NextResponse.json({ error: 'আপনি নিজের অ্যাকাউন্ট স্থগিত করতে পারবেন না' }, { status: 400 });
      }
      if (role === 'editor') {
        const totalAdmins = await db.collection('users').countDocuments({ role: 'admin' });
        if (totalAdmins <= 1) {
          return NextResponse.json({ error: 'সিস্টেমে অন্তত একজন অ্যাডমিন থাকা আবশ্যক' }, { status: 400 });
        }
      }
    }

    const updateDoc: Record<string, any> = {};
    if (role === 'admin' || role === 'editor') updateDoc.role = role;
    if (status === 'active' || status === 'suspended') updateDoc.status = status;
    if (name && typeof name === 'string') updateDoc.name = name.trim();

    if (Object.keys(updateDoc).length === 0) {
      return NextResponse.json({ error: 'আপডেট করার মতো কোনো তথ্য প্রদান করা হয়নি' }, { status: 400 });
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    return NextResponse.json({ success: true, message: 'ব্যবহারকারীর তথ্য আপডেট করা হয়েছে!' });
  } catch (error) {
    console.error('ইউজার আপডেট এরর:', error);
    return NextResponse.json({ error: 'ব্যবহারকারী আপডেট করতে ব্যর্থ' }, { status: 500 });
  }
}

// ২. ব্যবহারকারী এবং তার সংশ্লিষ্ট সকল ফর্ম ও রেসপন্স ডিলিট করা
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'শুধুমাত্র অ্যাডমিনদের প্রবেশাধিকার রয়েছে' }, { status: 403 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'অকার্যকর ব্যবহারকারী আইডি' }, { status: 400 });
    }

    const currentAdminId = (session.user as any).id;
    if (id === currentAdminId) {
      return NextResponse.json({ error: 'আপনি নিজের অ্যাডমিন অ্যাকাউন্ট ডিলিট করতে পারবেন না' }, { status: 400 });
    }

    const db = await getDatabase();

    // ইউজারের তৈরি সব ফর্মের আইডি সংগ্রহ
    const userForms = await db
      .collection('forms')
      .find({ userId: id }, { projection: { _id: 1 } })
      .toArray();

    const formIds = userForms.map((f) => f._id);

    // ১. সংশ্লিষ্ট ফর্মের সমস্ত রেসপন্স ডিলিট
    if (formIds.length > 0) {
      await db.collection('responses').deleteMany({ formId: { $in: formIds } });
    }

    // ২. ইউজারের ফর্মগুলো ডিলিট
    await db.collection('forms').deleteMany({ userId: id });

    // ৩. মূল ইউজার অ্যাকাউন্ট ডিলিট
    await db.collection('users').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'ব্যবহারকারী ও তার সকল ফর্ম এবং রেসপন্স সম্পূর্ণ মুছে ফেলা হয়েছে!',
    });
  } catch (error) {
    console.error('ইউজার ডিলিট এরর:', error);
    return NextResponse.json({ error: 'ব্যবহারকারী ডিলিট করা যায়নি' }, { status: 500 });
  }
}
