// app/api/forms/[id]/submit/route.ts
// এই ফাইলে সাধারণ উত্তরদাতাদের সাবমিট করা উত্তর ডেটাবেজে সংরক্ষণের রুট তৈরি করা হয়েছে।

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeObject, getClientIp } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ভুল ফর্ম আইডি' }, { status: 400 });
    }

    // স্প্যামিং রোধ: একই আইপি থেকে প্রতি মিনিটে সর্বোচ্চ ১০টি সাবমিশন এলাউ করা হবে
    const clientIp = getClientIp(req);
    const isAllowed = checkRateLimit(`submit_${clientIp}_${id}`, 10, 60 * 1000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'আপনি খুব দ্রুত ফর্ম সাবমিট করছেন। কিছুক্ষণ পর আবার চেষ্টা করুন।' },
        { status: 429 }
      );
    }

    const db = await getDatabase();

    // ফর্মটি যাচাই করা হচ্ছে
    const form = await db.collection('forms').findOne({
      _id: new ObjectId(id),
      isPublished: true,
    });

    if (!form) {
      return NextResponse.json({ error: 'ফর্মটি পাওয়া যায়নি অথবা বর্তমানে নিষ্ক্রিয়।' }, { status: 404 });
    }

    const body = await req.json();
    const rawAnswers = body.answers || {};

    // সার্ভার-সাইড ভ্যালিডেশন: যে ফিল্ডগুলো Required, সেগুলো আসলেই পূরণ করা হয়েছে কি না
    for (const field of form.fields) {
      if (field.required) {
        const value = rawAnswers[field.id];
        const isEmpty =
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          return NextResponse.json(
            { error: `"${field.label}" পূরণ করা আবশ্যক!` },
            { status: 400 }
          );
        }
      }
    }

    // উত্তরগুলো স্যানিটাইজ করা (XSS ও স্ক্রিপ্ট ইনজেকশন প্রতিরোধ)
    const cleanAnswers = sanitizeObject(rawAnswers);

    // র মঙ্গোডিবি ইনসার্ট: রেসপন্স সেভ করা
    await db.collection('responses').insertOne({
      formId: new ObjectId(id),
      answers: cleanAnswers,
      submittedAt: new Date(),
      respondentIp: clientIp,
    });

    return NextResponse.json(
      { message: 'আপনার উত্তর সফলভাবে জমা হয়েছে!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('ফর্ম সাবমিশন এরর:', error);
    return NextResponse.json({ error: 'রেসপন্স সাবমিট করা যায়নি।' }, { status: 500 });
  }
}
