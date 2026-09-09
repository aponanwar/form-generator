// lib/auth.ts
// এই ফাইলে NextAuth-এর সমস্ত অপশন ও প্রভাইডার কনফিগারেশন ডিফাইন করা হয়েছে।
// অ্যাপ রাউটার টাইপ সেফটি বজায় রাখতে এটি রুট হ্যান্ডলারের বাইরে সংরক্ষণ করা হয়েছে।

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { sanitizeInput } from '@/lib/security';

export const authOptions: NextAuthOptions = {
  // সেশন সংরক্ষণের জন্য নিরাপদ ও দ্রুত স্টেটলেস JWT স্ট্র্যাটেজি (Vercel Serverless বান্ধব)
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // ৩০ দিনের সেশন ভ্যালিডিটি
  },
  providers: [
    // ১. গুগল সাইন-ইন প্রভাইডার
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_id_until_configured',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret_until_configured',
    }),
    // ২. ইমেইল ও পাসওয়ার্ড সাইন-ইন প্রভাইডার
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'ইমেইল', type: 'email' },
        password: { label: 'পাসওয়ার্ড', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড দুটোই প্রদান করুন।');
        }

        const email = sanitizeInput(credentials.email.toLowerCase());
        const db = await getDatabase();

        // র মঙ্গোডিবি কুয়েরি: ইমেইল দিয়ে ইউজার ডেটা খোঁজা
        const user = await db.collection('users').findOne({ email });

        if (!user) {
          throw new Error('এই ইমেইলে কোনো ব্যবহারকারী পাওয়া যায়নি।');
        }

        if (!user.password) {
          throw new Error('এই অ্যাকাউন্টটি গুগল দিয়ে তৈরি করা হয়েছে। গুগল সাইন-ইন ব্যবহার করুন।');
        }

        // Bcrypt দিয়ে পাসওয়ার্ড হ্যাশ মিলিয়ে দেখা
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
        }

        // সফল লগইন হলে ইউজারের তথ্য রিটার্ন করা
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
        };
      },
    }),
  ],
  callbacks: {
    // গুগল সাইন-ইন সফল হলে ডাটাবেজে ইউজার না থাকলে স্বয়ংক্রিয়ভাবে নতুন ইউজার রেকর্ড তৈরি
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const db = await getDatabase();
          const existingUser = await db.collection('users').findOne({ email: user.email.toLowerCase() });

          if (!existingUser) {
            // র মঙ্গোডিবি ইনসার্ট: নতুন গুগল ইউজার যুক্ত করা
            const result = await db.collection('users').insertOne({
              name: user.name || 'Google User',
              email: user.email.toLowerCase(),
              image: user.image,
              createdAt: new Date(),
            });
            user.id = result.insertedId.toString();
          } else {
            user.id = existingUser._id.toString();
          }
        } catch (err) {
          console.error('গুগল সাইন-ইন হ্যান্ডলিং এরর:', err);
          return false;
        }
      }
      return true;
    },
    // JWT টোকেনে ইউজার আইডি সেট করা
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // সেশনে ইউজার আইডি পাস করা যাতে রিকোয়েস্টে সরাসরি ইউজারের আইডি পাওয়া যায়
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // কাস্টম সাইন-ইন পেজ পাথ
  },
  secret: process.env.NEXTAUTH_SECRET,
};
