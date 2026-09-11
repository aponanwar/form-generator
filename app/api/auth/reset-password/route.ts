// app/api/auth/reset-password/route.ts
// টোকেন ভ্যালিডেশন এবং ব্যবহারকারীর নতুন পাসওয়ার্ড সংরক্ষণের API

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeInput, getClientIp } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const isAllowed = checkRateLimit(`reset_pw_${clientIp}`, 5, 15 * 60 * 1000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'অতিরিক্ত অনুরোধ করা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, token, newPassword, lang = 'bn' } = body;

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: lang === 'en' ? 'All fields are required.' : 'সমস্ত তথ্য প্রদান করা আবশ্যক।' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: lang === 'en' ? 'Password must be at least 6 characters.' : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const db = await getDatabase();

    // ডাটাবেজে ইউজার, টোকেন হ্যাশ ও মেয়াদের বৈধতা যাচাই
    const user = await db.collection('users').findOne({
      email: sanitizedEmail,
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            lang === 'en'
              ? 'Invalid or expired reset token. Please request a new password reset.'
              : 'পাসওয়ার্ড রিসেট লিংকটি ভুল অথবা এর মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
        },
        { status: 400 }
      );
    }

    // নতুন পাসওয়ার্ড নিরাপদ ১২ সল্ট রাউন্ডে হ্যাশিং
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // পাসওয়ার্ড আপডেট এবং রিসেট টোকেন মুছে ফেলা
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword, updatedAt: new Date() },
        $unset: { resetPasswordToken: '', resetPasswordExpires: '' },
      }
    );

    return NextResponse.json({
      success: true,
      message:
        lang === 'en'
          ? 'Your password has been successfully reset! You can now log in.'
          : 'আপনার পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে! এখন লগইন করতে পারেন।',
    });
  } catch (error) {
    console.error('রিসেট পাসওয়ার্ড এরর:', error);
    return NextResponse.json({ error: 'সার্ভারে অভ্যন্তরীণ সমস্যা দেখা দিয়েছে।' }, { status: 500 });
  }
}
