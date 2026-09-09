// app/api/forms/[id]/public/route.ts
// এই ফাইলে সাধারণ উত্তরদাতাদের জন্য পাবলিক ফর্ম ডেটা পাঠানোর API তৈরি করা হয়েছে।
// এখানে ইউজারের কোনো সংবেদনশীল তথ্য (যেমন userId) রিটার্ন করা হয় না।

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'ভুল ফর্ম লিংক' }, { status: 400 });
    }

    const db = await getDatabase();

    // শুধুমাত্র পাবলিশ করা ফর্ম রিটার্ন করা হচ্ছে
    const form = await db.collection('forms').findOne(
      { _id: new ObjectId(id), isPublished: true },
      {
        projection: {
          title: 1,
          description: 1,
          fields: 1,
          settings: 1,
          createdAt: 1,
        },
      }
    );

    if (!form) {
      return NextResponse.json({ error: 'ফর্মটি খুঁজে পাওয়া যায়নি অথবা বর্তমানে বন্ধ আছে।' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('পাবলিক ফর্ম ফেচ এরর:', error);
    return NextResponse.json({ error: 'সার্ভার ত্রুটি' }, { status: 500 });
  }
}
