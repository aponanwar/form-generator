'use client';
// components/SessionProvider.tsx
// NextAuth সেশন প্রোভাইডার ক্লায়েন্ট র‍্যাপার

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import React from 'react';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
