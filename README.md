# 🚀 NextForm - স্মার্ট ও আধুনিক ওয়েব ফর্ম জেনারেটর

**NextForm** হলো একটি আধুনিক, উচ্চ ক্ষমতাসম্পন্ন এবং দৃষ্টিনন্দন ওয়েব অ্যাপ্লিকেশন যা ব্যবহারকারীদের গুগুল ফর্মের একঘেয়েমি দূর করে নিজস্ব রুচি অনুযায়ী ফর্ম তৈরি, কাস্টমাইজেশন, শেয়ার এবং সংগৃহীত তথ্য সরাসরি Microsoft Excel (.xlsx) ফাইলে নামানোর সুবিধা দেয়।

---

## ✨ প্রধান বৈশিষ্ট্যসমূহ (Features)

1. **🎨 কাস্টমাইজেবল ও প্রিমিয়াম ডিজাইন (Not boring Google Forms):**
   - **কালার থিম নির্বাচন:** রয়্যাল ইন্ডিগো, এমারেল্ড গ্রিন, রোজ পিঙ্ক, ইলেকট্রিক ভায়োলেট, ওশান সায়ান ইত্যাদি সহ কাস্টম হেক্স কোড।
   - **ব্যাকগ্রাউন্ড স্টাইল:** গ্রেডিয়েন্ট মেশ, ফ্রস্টেড গ্লাস মরফিজম (Glassmorphism), মিনিম্যাল হোয়াইট, সানসেট ওয়ার্ম এবং ডার্ক মোড।
   - **হেডার ব্যানার গ্রেডিয়েন্ট:** ভাইব্রেন্ট গ্রেডিয়েন্ট কাভার।
   - **রিয়েলটাইম লাইভ ক্যানভাস প্রিভিউ:** ফর্ম তৈরির সময় সরাসরি দেখতে পাওয়া ফর্মটি কেমন দেখাবে।

2. **⚡ MongoDB Raw Driver:**
   - কোনো ভারী ORM (যেমন Mongoose) ছাড়া সরাসরি অফিসিয়াল `mongodb` নেটিভ ড্রাইভার দিয়ে র কুয়েরি।
   - Vercel Serverless-এর জন্য গ্লোবাল কানেকশন ক্যাশিং এবং পুলিং যাতে কানেকশন ড্রপ বা লিমিট এক্সিড না হয়।

3. **🖼️ ছবি ও ফাইল আপলোড (Cloudinary CDN):**
   - ইমেজ এবং ডকুমেন্ট আপলোডের জন্য Cloudinary ইন্টিগ্রেশন।
   - ১MB, ২MB, ৫MB, ১০MB, ২০MB ফাইল সাইজ লিমিটেশন।
   - লাইভ প্রিভিউ এবং MongoDB-তে সুরক্ষিত লিঙ্ক সংরক্ষণ।

4. **📑 PDF ও Excel এক্সপোর্ট:**
   - **Excel (.xlsx):** SheetJS দিয়ে স্বয়ংক্রিয় স্প্রেডশিট।
   - **PDF (.pdf):** প্রিন্ট-রেডি ভেক্টর PDF রিপোর্ট এবং একক উত্তরদাতার জন্য পৃথক PDF রসিদ।

5. **👑 ইউজার রোল ও কন্ট্রোল সেন্টার (Admin & Editor):**
   - **রোল ব্যাজ ও নেভবার সুইচার:** নেভবারে দৃশ্যমান `👑 Admin` বা `✏️ Editor` ব্যাজ ও সহজে রোল পরিবর্তনের সুবিধা।
   - **অ্যাডমিন পোর্টাল (`/admin`):** সমগ্র ব্যবহারকারীদের তালিকা, রোল পরিবর্তন, সাসপেন্ড/এক্টিভেট, সরাসরি ইউজার ক্রিয়েশন এবং সকল ফর্মের পূর্ণাঙ্গ তদারকি।
   - **রোল-ভিত্তিক পারমিশন (RBAC):** অ্যাডমিনদের সিস্টেমের যেকোনো ফর্ম, রেসপন্স ও এক্সেল ডাউনলোড দেখার পূর্ণ ক্ষমতা।

6. **🔗 সোশ্যাল শেয়ার মডাল (WhatsApp, Messenger, Email):**
   - এক ক্লিকে লিংক কপি এবং সরাসরি WhatsApp, Messenger ও Email-এ শেয়ার।
   - ডিভাইসের নেটিভ শেয়ার শিট সমর্থন।

7. **🌐 সম্পূর্ণ দ্বিভাষিক সমর্থন (EN / BN):**
   - সম্পূর্ণ ইংরেজি ও বাংলা ভাষা টগল।

8. **🔤 Google Sans টাইপোগ্রাফি:**
   - অ্যাপ্লিকেশনের সর্বত্র প্রিমিয়াম গুগল সান্স (Google Sans / Product Sans) ফন্ট।

9. **🔐 সর্বোচ্চ নিরাপত্তা (Maximum Security):**
   - NextAuth (Credentials + Google OAuth), Bcrypt ১২ রাউন্ড, XSS Sanitization, NoSQL Injection ডিফেন্স এবং আইপি রেট লিমিটিং।

---

## 🛠️ প্রযুক্তি স্ট্যাক (Tech Stack)

- **ফ্রন্টএন্ড ও ফ্রেমওয়ার্ক:** Next.js 14 (App Router)
- **ল্যাঙ্গুয়েজ:** TypeScript
- **টাইপোগ্রাফি:** Google Sans
- **স্টাইলিং:** Tailwind CSS, Lucide React
- **ডাটাবেজ:** MongoDB (Native Raw Driver)
- **ক্লাউড স্টোরেজ:** Cloudinary
- **অথেনটিকেশন ও RBAC:** NextAuth.js (Credentials + Google OAuth, Admin/Editor RBAC)
- **ডকুমেন্ট এক্সপোর্ট:** SheetJS (Excel), html2pdf.js (PDF)
- **হোস্টিং ও ডিপ্লয়মেন্ট:** Vercel

---

## ⚙️ ইনস্টলেশন ও লোকাল রান গাইড

### ১. ডিপেন্ডেন্সি ইনস্টল করুন:
```bash
npm install
```

### ২. এনভায়রনমেন্ট ভেরিয়েবল সেটআপ:
`.env.local` ফাইলটি কনফিগার করুন:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### ৩. ডেভেলপমেন্ট সার্ভার চালু করুন:
```bash
npm run dev
```
ব্রাউজারে [http://localhost:3000](http://localhost:3000) লিংকে ভিজিট করুন।

---

## ☁️ Vercel-এ ডিপ্লয়মেন্ট

1. প্রোজেক্টটি আপনার GitHub রিপোজিটরিতে পুশ করুন।
2. **[Vercel Dashboard](https://vercel.com/)**-এ গিয়ে রিপোজিটরিটি ইম্পোর্ট করুন।
3. **Environment Variables**-এ `.env.example`-এর ভেরিয়েবলগুলো যোগ করুন।
4. **Deploy** বাটনে চাপুন।