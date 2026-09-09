// app/api/forms/route.ts
// এই ফাইলে ব্যবহারকারীর সব ফর্মের তালিকা প্রদর্শন এবং নতুন ফর্ম তৈরির API তৈরি করা হয়েছে।

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeInput } from '@/lib/security';
import { ThemeSettings } from '@/types';

// ১. ইউজারের সকল ফর্ম তালিকা এবং রেসপন্স সংখ্যা আনার GET মেথড
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ (Unauthorized)' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const db = await getDatabase();

    // র মঙ্গোডিবি অ্যাগ্রিগেশন: ফর্মের সাথে রেসপন্স কালেকশন লিংক করে মোট উত্তর সংখ্যা নির্ণয়
    const forms = await db
      .collection('forms')
      .aggregate([
        { $match: { userId } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: 'responses',
            localField: '_id',
            foreignField: 'formId',
            as: 'responsesList',
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            settings: 1,
            isPublished: 1,
            createdAt: 1,
            responseCount: { $size: '$responsesList' },
          },
        },
      ])
      .toArray();

    return NextResponse.json({ forms });
  } catch (error) {
    console.error('ফর্ম ফেচ এরর:', error);
    return NextResponse.json({ error: 'ফর্ম তালিকা লোড করা যায়নি।' }, { status: 500 });
  }
}

// ২. নতুন আকর্ষণীয় ফর্ম তৈরি করার POST মেথড
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'অননুমোদিত অনুরোধ' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json().catch(() => ({}));

    const isEn = body.lang === 'en';

    const defaultTheme: ThemeSettings = {
      themeColor: '#4F46E5',
      backgroundTheme: 'mesh',
      cardStyle: 'glassmorphic',
      buttonText: isEn ? 'Submit' : 'জমা দিন',
      coverGradient: 'from-indigo-600 via-purple-600 to-pink-500',
    };

    const defaultTitle = isEn ? 'Untitled Form' : 'নতুন ফর্ম';
    const defaultDesc = isEn
      ? 'Please provide your valuable feedback and information through this form.'
      : 'এই ফর্মটিতে আপনার মতামত ও তথ্য প্রদান করুন।';

    const defaultFields = isEn
      ? [
          {
            id: 'field_' + Math.random().toString(36).substring(2, 9),
            type: 'text',
            label: 'Full Name',
            placeholder: 'Enter your name...',
            required: true,
            width: 'full',
          },
          {
            id: 'field_' + Math.random().toString(36).substring(2, 9),
            type: 'email',
            label: 'Email Address',
            placeholder: 'example@email.com',
            required: true,
            width: 'full',
          },
        ]
      : [
          {
            id: 'field_' + Math.random().toString(36).substring(2, 9),
            type: 'text',
            label: 'আপনার পূর্ণ নাম',
            placeholder: 'এখানে আপনার নাম লিখুন...',
            required: true,
            width: 'full',
          },
          {
            id: 'field_' + Math.random().toString(36).substring(2, 9),
            type: 'email',
            label: 'আপনার ইমেইল ঠিকানা',
            placeholder: 'example@email.com',
            required: true,
            width: 'full',
          },
        ];

    const newForm = {
      userId,
      title: sanitizeInput(body.title || defaultTitle),
      description: sanitizeInput(body.description || defaultDesc),
      fields: body.fields && body.fields.length > 0 ? body.fields : defaultFields,
      settings: body.settings || defaultTheme,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('forms').insertOne(newForm);

    return NextResponse.json({ formId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('ফর্ম ক্রিয়েট এরর:', error);
    return NextResponse.json({ error: 'নতুন ফর্ম তৈরি করা সম্ভব হয়নি।' }, { status: 500 });
  }
}
