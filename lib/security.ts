// lib/security.ts
// এই ফাইলে অ্যাপ্লিকেশনের সর্বোচ্চ নিরাপত্তা ও ডেটা স্যানিটাইজেশন লজিক রয়েছে।
// এটি Cross-Site Scripting (XSS) এবং NoSQL Injection আক্রমণ প্রতিরোধ করে।

import sanitizeHtml from 'sanitize-html';

/**
 * যেকোনো ক্ষতিকর HTML ট্যাগ ও জাভাস্ক্রিপ্ট স্ক্রিপ্ট ইনজেকশন মুছে ফেলার ফাংশন
 * @param {string} dirtyText ব্যবহারকারীর কাঁচা টেক্সট ইনপুট
 * @returns {string} নিরাপদ ও স্যানিটাইজড টেক্সট
 */
export function sanitizeInput(dirtyText: string): string {
  if (typeof dirtyText !== 'string') return dirtyText;

  // কোনো প্রকার এইচটিএমএল ট্যাগ অ্যালাউ করা হবে না (শুধু প্লেইন টেক্সট সংরক্ষিত হবে)
  return sanitizeHtml(dirtyText, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

/**
 * রেসপন্স বা ফর্ম অবজেক্টের প্রতিটি কী এবং ভ্যালুকে রিকার্সিভলি স্যানিটাইজ করে
 * @param obj যেকোনো জটিল ডেটা অবজেক্ট
 * @returns স্যানিটাইজ করা নিরাপদ অবজেক্ট
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    // কী স্যানিটাইজেশন (NoSQL অপারেটর যেমন $gt, $ne বন্ধ করার জন্য)
    const cleanKey = key.replace(/^\$/, '');

    if (typeof value === 'string') {
      sanitized[cleanKey] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[cleanKey] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[cleanKey] = sanitizeObject(value);
    } else {
      sanitized[cleanKey] = value;
    }
  }

  return sanitized;
}

/**
 * ক্লায়েন্ট আইপি অ্যাড্রেস শনাক্ত করার ফাংশন (রেট লিমিটিং ও স্প্যাম ট্র্যাকিংয়ের জন্য)
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
