// app/api/forms/[id]/route.ts
// এই ফাইলে নির্দিষ্ট একটি ফর্ম দেখা, আপডেট করা ও ডিলিট করার API রয়েছে।
// এতে কঠোর অথরাইজেশন চেক রয়েছে যাতে অন্য কেউ অন্যের ফর্ম এডিট বা ডিলিট করতে না পারে।

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeInput, sanitizeObject } from '@/lib/security';

// নির্দিষ্ট ফর্মের তথ্য লোড করা
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ভুল ফর্ম আইডি' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === 'admin';
    const db = await getDatabase();

    const query = isAdmin ? { _id: new ObjectId(id) } : { _id: new ObjectId(id), userId };
    const form = await db.collection('forms').findOne(query);

    if (!form) {
      return NextResponse.json({ error: 'ফর্মটি পাওয়া যায়নি অথবা দেখার অধিকার নেই' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('ফর্ম ফেচ এরর:', error);
    return NextResponse.json({ error: 'সার্ভার সমস্যা' }, { status: 500 });
  }
}

// ফর্ম আপডেট করা (শিরোনাম, ফিল্ড, থিম ইত্যাদি সংরক্ষণ)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ভুল ফর্ম আইডি' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === 'admin';
    const body = await req.json();

    const db = await getDatabase();

    // নিরাপত্তা: ফর্মের মালিকানা বা অ্যাডমিন পারমিশন যাচাই
    const formQuery = isAdmin ? { _id: new ObjectId(id) } : { _id: new ObjectId(id), userId };
    const existingForm = await db.collection('forms').findOne(formQuery);

    if (!existingForm) {
      return NextResponse.json({ error: 'ফর্মটি পরিবর্তনের অনুমতি নেই' }, { status: 403 });
    }

    // ডেটা স্যানিটাইজেশন
    const cleanTitle = sanitizeInput(body.title || 'শিরোনামহীন ফর্ম');
    const cleanDesc = sanitizeInput(body.description || '');
    const cleanFields = sanitizeObject(body.fields || []);
    const cleanSettings = sanitizeObject(body.settings || existingForm.settings);

    // র মঙ্গোডিবি আপডেট কুয়েরি
    await db.collection('forms').updateOne(
      formQuery,
      {
        $set: {
          title: cleanTitle,
          description: cleanDesc,
          fields: cleanFields,
          settings: cleanSettings,
          isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : existingForm.isPublished,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ message: 'ফর্ম সফলভাবে আপডেট করা হয়েছে!' });
  } catch (error) {
    console.error('ফর্ম আপডেট এরর:', error);
    return NextResponse.json({ error: 'ফর্ম আপডেট করা সম্ভব হয়নি' }, { status: 500 });
  }
}

// ফর্ম ডিলিট করা
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ' }, { status: 401 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ভুল ফর্ম আইডি' }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === 'admin';
    const db = await getDatabase();

    // ফর্ম ডিলিট করা (অ্যাডমিন যেকোনো ফর্ম ডিলিট করতে পারে)
    const deleteQuery = isAdmin ? { _id: new ObjectId(id) } : { _id: new ObjectId(id), userId };
    const deleteResult = await db.collection('forms').deleteOne(deleteQuery);

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: 'ফর্ম ডিলিট করার অনুমতি নেই' }, { status: 403 });
    }

    // এই ফর্মের অধীনে থাকা সব রেসপন্সও ক্লিনআপ করা হচ্ছে
    await db.collection('responses').deleteMany({ formId: new ObjectId(id) });

    return NextResponse.json({ message: 'ফর্ম ও সংশ্লিষ্ট সকল রেসপন্স ডিলিট করা হয়েছে!' });
  } catch (error) {
    console.error('ফর্ম ডিলিট এরর:', error);
    return NextResponse.json({ error: 'ফর্ম ডিলিট করা যায়নি' }, { status: 500 });
  }
}
