// lib/rate-limit.ts
// এই ফাইলে ব্রুট-ফোর্স পাসওয়ার্ড অ্যাটাক ও ফর্ম স্প্যামিং ঠেকানোর জন্য ইন-মেমোরি রেট লিমিটার তৈরি করা হয়েছে।

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * আইপি বা কী-ভিত্তিক রিকোয়েস্ট লিমিট চেক করার ফাংশন
 * @param key ট্র্যাকিং কি (যেমন: ip_signup অথবা ip_form_123)
 * @param limit সর্বোচ্চ অনুমোদিত রিকোয়েস্ট সংখ্যা
 * @param windowMs সময়সীমা (মিলিসেকেন্ডে)
 * @returns {boolean} রিকোয়েস্টটি কি সীমার মধ্যে আছে (true = অনুমোদিত, false = লিমিট অতিক্রান্ত)
 */
export function checkRateLimit(key: string, limit: number = 60, windowMs: number = 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // মেয়াদোত্তীর্ণ রেকর্ড মুছে ফেলা হচ্ছে
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  // সীমা পার হলে বাতিল
  if (record.count >= limit) {
    return false;
  }

  // কাউন্ট ১ বৃদ্ধি করা হচ্ছে
  record.count += 1;
  return true;
}
