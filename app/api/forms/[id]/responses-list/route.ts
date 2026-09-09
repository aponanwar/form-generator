// app/api/forms/[id]/responses-list/route.ts
// এই ফাইলে ড্যাশবোর্ডে রেসপন্স প্রিভিউ দেখানোর জন্য সমস্ত উত্তর লোড করার API রয়েছে।
// এতে কঠোর মালিকানা যাচাইকরণ যুক্ত রয়েছে।

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

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
    const db = await getDatabase();

    // নিরাপত্তা: ফর্মটি বর্তমান ইউজারের কি না নিশ্চিত করা
    const form = await db.collection('forms').findOne({
      _id: new ObjectId(id),
      userId: userId,
    });

    if (!form) {
      return NextResponse.json({ error: 'ফর্মটি পাওয়া যায়নি অথবা দেখার অধিকার নেই' }, { status: 403 });
    }

    // রেসপন্স কালেকশন থেকে সব উত্তর নতুন থেকে পুরানো ক্রমানুসারে নিয়ে আসা
    const responses = await db
      .collection('responses')
      .find({ formId: new ObjectId(id) })
      .sort({ submittedAt: -1 })
      .toArray();

    return NextResponse.json({ form, responses });
  } catch (error) {
    console.error('রেসপন্স লিস্ট ফেচ এরর:', error);
    return NextResponse.json({ error: 'রেসপন্স লোড করা যায়নি' }, { status: 500 });
  }
}
