// app/api/auth/forgot-password/route.ts
// পাসওয়ার্ড ভুলে যাওয়া ব্যবহারকারীদের জন্য নিরাপদ রিসেট লিংক তৈরি ও ইমেইল প্রেরণের API

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeInput, getClientIp } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    // নিরাপত্তা: স্প্যামিং প্রতিরোধে আইপি ভিত্তিক রেট লিমিটিং (১৫ মিনিটে সর্বোচ্চ ৫টি অনুরোধ)
    const clientIp = getClientIp(req);
    const isAllowed = checkRateLimit(`forgot_pw_${clientIp}`, 5, 15 * 60 * 1000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'অতিরিক্ত অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, lang = 'bn' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: lang === 'en' ? 'Please provide a valid email.' : 'অনুগ্রহ করে সঠিক ইমেইল প্রদান করুন।' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    const db = await getDatabase();

    // ডাটাবেজে ইউজার খোঁজা
    const user = await db.collection('users').findOne({ email: sanitizedEmail });

    // যদি অ্যাকাউন্টটি শুধুমাত্র Google OAuth দিয়ে তৈরি হয়ে থাকে
    if (user && !user.password) {
      return NextResponse.json({
        error:
          lang === 'en'
            ? 'This account uses Google Sign-In. Please sign in directly with Google.'
            : 'এই অ্যাকাউন্টটি গুগল সাইন-ইন দিয়ে নিবন্ধিত। অনুগ্রহ করে গুগল দিয়ে সরাসরি লগইন করুন।',
      }, { status: 400 });
    }

    // ব্যবহারকারী পাওয়া গেলে রিসেট টোকেন তৈরি
    if (user) {
      // ক্রিপ্টোগ্রাফিক র্যান্ডম টোকেন ও SHA-256 হ্যাশ তৈরি
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // ১ ঘণ্টার মেয়াদ

      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordToken: tokenHash,
            resetPasswordExpires: expires,
          },
        }
      );

      // রিসেট লিঙ্ক প্রস্তুত
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(sanitizedEmail)}`;

      // ইমেইল প্রেরণ
      const mailResult = await sendPasswordResetEmail({
        to: sanitizedEmail,
        resetUrl,
        lang: lang as 'en' | 'bn',
      });

      return NextResponse.json({
        success: true,
        message:
          lang === 'en'
            ? 'A password reset link has been sent to your email.'
            : 'পাসওয়ার্ড রিসেট করার লিংক আপনার ইমেইলে পাঠানো হয়েছে।',
        devResetUrl: mailResult.method === 'dev-preview' ? resetUrl : undefined,
      });
    }

    // ইউজার নিরাপত্তা: একাউন্ট না পাওয়া গেলেও নিশ্চিত বার্তা প্রদর্শন (User enumeration prevention)
    return NextResponse.json({
      success: true,
      message:
        lang === 'en'
          ? 'If an account exists with this email, a password reset link has been sent.'
          : 'এই ইমেইলটি নিবন্ধিত থাকলে পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।',
    });
  } catch (error) {
    console.error('ফরগট পাসওয়ার্ড এরর:', error);
    return NextResponse.json({ error: 'সার্ভারে অভ্যন্তরীণ সমস্যা দেখা দিয়েছে।' }, { status: 500 });
  }
}
