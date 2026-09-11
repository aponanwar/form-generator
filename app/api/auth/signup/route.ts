// app/api/auth/signup/route.ts
// এই ফাইলে নতুন ব্যবহারকারী রেজিস্ট্রেশনের নিরাপদ API রুট তৈরি করা হয়েছে।

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeInput, getClientIp } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

// রেজিস্ট্রেশন ইনপুট ভ্যালিডেশন স্কিমা (Zod)
const signupSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').max(60, 'নাম সর্বোচ্চ ৬০ অক্ষরের হতে পারে'),
  email: z.string().email('সঠিক ইমেইল অ্যাড্রেস প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'),
});

export async function POST(req: Request) {
  try {
    // নিরাপত্তা: স্প্যামিং ও রোবট রেজিস্ট্রেশন প্রতিরোধে রেট লিমিটিং (১ মিনিটে সর্বোচ্চ ৫টি অনুরোধ)
    const clientIp = getClientIp(req);
    const isAllowed = checkRateLimit(`signup_${clientIp}`, 5, 60 * 1000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'অতিরিক্ত অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Zod দিয়ে ইনপুট ফরম্যাট ও টাইপ যাচাই
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedName = sanitizeInput(name);

    const db = await getDatabase();

    // চেক করা হচ্ছে ইমেইলটি আগে থেকেই ব্যবহৃত কি না (র কুয়েরি)
    const existingUser = await db.collection('users').findOne({ email: sanitizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'এই ইমেইলটি ইতিপূর্বে ব্যবহার করা হয়েছে। অনুগ্রহ করে লগইন করুন।' },
        { status: 409 }
      );
    }

    // পাসওয়ার্ড নিরাপদ ১২ সল্ট রাউন্ডে হ্যাশিং
    const hashedPassword = await bcrypt.hash(password, 12);

    // প্রথম ব্যবহারকারীকে স্বয়ংক্রিয়ভাবে admin রোল প্রদান, বাকিদের editor
    const userCount = await db.collection('users').countDocuments();
    const role = userCount === 0 ? 'admin' : 'editor';

    // র মঙ্গোডিবিতে নতুন ইউজার ডেটা ইনসার্ট করা
    const result = await db.collection('users').insertOne({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: role,
      status: 'active',
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!', userId: result.insertedId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('রেজিস্ট্রেশন ত্রুটি:', error);
    return NextResponse.json(
      { error: 'সার্ভারে অভ্যন্তরীণ ত্রুটি দেখা দিয়েছে।' },
      { status: 500 }
    );
  }
}
