// app/api/admin/forms/route.ts
// অ্যাডমিন কর্তৃক সিস্টেমের যেকোনো ব্যবহারকারীর তৈরি সব ফর্ম পর্যবেক্ষণ করার API

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
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

    const forms = await db
      .collection('forms')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // প্রতিটি ফর্মের সাথে ক্রিয়েটর এবং রেসপন্স সংখ্যা যোগ করা
    const enrichedForms = await Promise.all(
      forms.map(async (form) => {
        let creatorName = 'Unknown User';
        let creatorEmail = 'No email';

        if (form.userId && ObjectId.isValid(form.userId)) {
          const user = await db.collection('users').findOne(
            { _id: new ObjectId(form.userId) },
            { projection: { name: 1, email: 1 } }
          );
          if (user) {
            creatorName = user.name || 'Anonymous';
            creatorEmail = user.email || '';
          }
        }

        const responsesCount = await db
          .collection('responses')
          .countDocuments({ formId: form._id });

        return {
          _id: form._id.toString(),
          title: form.title || 'Untitled Form',
          description: form.description || '',
          fieldsCount: form.fields?.length || 0,
          isPublished: form.isPublished ?? true,
          createdAt: form.createdAt || new Date(),
          creatorName,
          creatorEmail,
          responsesCount,
        };
      })
    );

    return NextResponse.json({ forms: enrichedForms });
  } catch (error) {
    console.error('অ্যাডমিন ফর্মস ফেচ এরর:', error);
    return NextResponse.json({ error: 'সার্ভার সমস্যা' }, { status: 500 });
  }
}
