// app/layout.tsx
// অ্যাপ্লিকেশনের রুট লেআউট ও ভাষা ও সেশন প্রোভাইডার কনফিগারেশন

import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'NextForm - Smart & Beautiful Form Generator',
  description: 'Create customizable, stylish, and secure forms. Direct raw MongoDB storage and Excel export.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        {/* NextAuth সেশন ও ভাষা কনটেক্সট র‍্যাপার */}
        <SessionProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
