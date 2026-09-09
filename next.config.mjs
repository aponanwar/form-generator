/** @type {import('next').NextConfig} */
// next.config.mjs
// সর্বোচ্চ নিরাপত্তা ও Vercel ডিপ্লয়মেন্ট নিশ্চিতকরণে সিকিউরিটি হেডার্স কনফিগারেশন

const nextConfig = {
  reactStrictMode: true,
  // সিকিউরিটি হেডার যোগ করা হচ্ছে
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ক্লিকজ্যাকিং (Clickjacking) আক্রমণ প্রতিরোধে ফ্রেম নিষিদ্ধ করা
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // ব্রাউজারকে MIME-টাইপ স্নিফিং করা থেকে বিরত রাখা
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // রেফারার সুরক্ষায় কেবল অরিজিন পাঠানো
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // লেগ্যাসি এক্সএসএস প্রোটেকশন
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // এইচটিটিপিএস বাধ্যতামূলক করতে HSTS কনফিগারেশন (২ বছর)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
