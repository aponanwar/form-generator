// app/api/forms/[id]/export/route.ts
// এই ফাইলে ফর্মের সকল রেসপন্স ডেটা সরাসরি Microsoft Excel (.xlsx) ফাইল হিসেবে
// তৈরি ও ব্রাউজারে ডাউনলোড করানোর সিকিউর ব্যাকএন্ড লজিক রয়েছে।

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import * as XLSX from 'xlsx';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // ১. ইউজারের সেশন চেক করা
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

    // ২. মালিকানা যাচাইকরণ: বর্তমান ইউজার ছাড়া অন্য কেউ এক্সেল ডেটা নামাতে পারবে না
    const form = await db.collection('forms').findOne({
      _id: new ObjectId(id),
      userId: userId,
    });

    if (!form) {
      return NextResponse.json({ error: 'ফর্মটি পাওয়া যায়নি অথবা ডাউনলোড করার অনুমতি নেই।' }, { status: 403 });
    }

    // ভাষা প্যারামিটার রিড করা
    const url = new URL(req.url);
    const isEn = url.searchParams.get('lang') === 'en';

    // ৩. রেসপন্স কালেকশন থেকে সমস্ত ডেটা সংগ্রহ
    const responses = await db
      .collection('responses')
      .find({ formId: new ObjectId(id) })
      .sort({ submittedAt: 1 })
      .toArray();

    // ৪. এক্সেল ফাইলের জন্য রো (Row) এবং কলাম অবজেক্ট তৈরি
    const excelRows = responses.map((res, index) => {
      const dateStr = isEn
        ? new Date(res.submittedAt).toLocaleString('en-US')
        : new Date(res.submittedAt).toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });

      const row: Record<string, any> = {
        [isEn ? 'Sl No' : 'ক্রমিক নং']: index + 1,
        [isEn ? 'Submission Date & Time' : 'জমা দেওয়ার তারিখ ও সময়']: dateStr,
      };

      // প্রতিটি ফিল্ডের প্রশ্নকে কলামের শিরোনাম হিসেবে ব্যবহার করা হচ্ছে
      form.fields.forEach((field: any) => {
        let answer = res.answers?.[field.id];

        if (Array.isArray(answer)) {
          answer = answer.join(', ');
        } else if (answer === undefined || answer === null) {
          answer = '';
        }

        row[field.label] = answer;
      });

      return row;
    });

    // ৫. SheetJS লাইব্রেরি ব্যবহার করে এক্সেল ওয়ার্কশিট ও ওয়ার্কবুক তৈরি
    const worksheet = XLSX.utils.json_to_sheet(excelRows);

    const columnWidths = [{ wch: 10 }, { wch: 25 }];
    form.fields.forEach((field: any) => {
      const len = Math.max(field.label.length * 2, 20);
      columnWidths.push({ wch: len });
    });
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, isEn ? 'Responses' : 'রেসপন্স তালিকা');

    // বাফার তৈরি
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // ফাইলের নিরাপদ নাম তৈরি
    const sanitizedFileName = (form.title || 'form')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .trim();

    // ৬. এক্সেল ফাইল ডাউনলোড রেসপন্স রিটার্ন করা
    return new Response(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(sanitizedFileName)}_responses.xlsx"`,
      },
    });
  } catch (error) {
    console.error('এক্সেল এক্সপোর্ট এরর:', error);
    return NextResponse.json({ error: 'এক্সেল ফাইল জেনারেট করা যায়নি।' }, { status: 500 });
  }
}
