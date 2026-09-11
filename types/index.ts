// types/index.ts
// সম্পূর্ণ অ্যাপ্লিকেশনের টাইপস্ক্রিপ্ট টাইপ ও ইন্টারফেস

// সমর্থিত ইনপুট ফিল্ডের ধরন (ছবি ও ফাইল আপলোড সহ)
export type FieldType =
  | 'text'        // সাধারণ সংক্ষিপ্ত উত্তর
  | 'paragraph'   // দীর্ঘ টেক্সট / অনুচ্ছেদ
  | 'number'      // সাংখ্যিক মান
  | 'email'       // ইমেইল অ্যাড্রেস
  | 'radio'       // একক পছন্দ (Multiple Choice)
  | 'checkbox'    // একাধিক পছন্দ (Checkboxes)
  | 'dropdown'    // ড্রপডাউন সিলেক্ট
  | 'date'        // ক্যালেন্ডার তারিখ
  | 'image'       // ছবি আপলোড (Cloudinary CDN লিঙ্ক সহ)
  | 'file';       // যেকোনো ডকুমেন্ট/ফাইল আপলোড

// প্রতিটি একক ফিল্ডের গঠন ও কাস্টম ডিজাইন সেটিংস
export interface FormField {
  id: string;              // ফিল্ডের ইউনিক আইডি
  type: FieldType;         // ফিল্ডের ধরন
  label: string;           // ফিল্ডের শিরোনাম বা প্রশ্ন
  placeholder?: string;    // প্লেসহোল্ডার টেক্সট
  required: boolean;       // উত্তর দেয়া কি বাধ্যতামূলক?
  options?: string[];      // radio, checkbox ও dropdown এর সম্ভাব্য অপশনসমূহ
  description?: string;    // প্রশ্নের নিচে সাহায্যকারী নির্দেশিকা
  width?: 'full' | 'half' | 'third'; // গ্রিড উইডথ: 100%, 50%, 33%

  // ফাইল ও ইমেজ আপলোড কনফিগারেশন
  maxSizeMB?: number;      // সর্বোচ্চ সাইজ (মেগাবাইটে, যেমন: 1, 2, 5, 10, 20 MB)
  allowedTypes?: string;   // অনুমোদিত ফাইল এক্সটেনশন

  // প্রতিটি ফিল্ডের জন্য একক কাস্টম কালার ও ডিজাইন অপশন
  customColor?: string;    // নির্দিষ্ট ফিল্ডের জন্য কাস্টম অ্যাকসেন্ট / বর্ডার কালার
  fieldCardStyle?: 'default' | 'subtle' | 'highlight' | 'glass'; // ফিল্ড কার্ডের ব্যাকগ্রাউন্ড ডিজাইন
}

// ফর্মের আকর্ষণীয় UI/UX কাস্টমাইজেশন সেটিংস
export interface ThemeSettings {
  themeColor: string;       // মূল ব্র্যান্ড বা অ্যাকসেন্ট কালার
  backgroundTheme: 'clean' | 'gradient' | 'dark' | 'warm' | 'mesh'; // ব্যাকগ্রাউন্ডের স্টাইল
  cardStyle: 'elevated' | 'bordered' | 'glassmorphic';              // ফর্ম কার্ডের স্টাইল
  buttonText: string;       // সাবমিট বাটনের কাস্টম টেক্সট
  coverGradient?: string;   // ব্যানারের সুন্দর কালার গ্রেডিয়েন্ট
}

// ডেটাবেজে সংরক্ষিত ফর্মের পূর্ণাঙ্গ ডেটা মডেল
export interface IForm {
  _id?: string;
  userId: string;           // ফর্মের মালিকের ইউজার আইডি
  title: string;            // ফর্মের নাম বা টাইটেল
  description: string;      // ফর্মের বর্ণনা
  fields: FormField[];      // ফর্মের ফিল্ডগুলোর অ্যারে
  settings: ThemeSettings;  // কাস্টম থিম ও স্টাইল সেটিংস
  isPublished: boolean;     // ফর্মটি কি পাবলিশ করা আছে?
  createdAt: Date;
  updatedAt: Date;
}

// সাধারণ উত্তরদাতাদের সাবমিট করা রেসপন্সের মডেল
export interface IResponse {
  _id?: string;
  formId: string;           // যে ফর্মের রেসপন্স
  answers: Record<string, any>; // ফিল্ড আইডি ও তার উত্তরের অবজেক্ট (ইমেজ ও ফাইলের ক্ষেত্রে ক্লাউডিনারি লিংক)
  submittedAt: Date;        // উত্তর জমা দেওয়ার সময়
  respondentIp?: string;    // সিকিউরিটি ও স্প্যাম রোধে আইপি অ্যাড্রেস
}

// ইউজার রোল ও অ্যাকাউন্ট স্ট্যাটাস টাইপ
export type UserRole = 'admin' | 'editor';
export type UserStatus = 'active' | 'suspended';

// ব্যবহারকারী (User) অ্যাকাউন্টের মডেল
export interface IUser {
  _id?: string;
  name: string;             // ইউজারের পূর্ণ নাম
  email: string;            // ইমেইল ঠিকানা
  password?: string;        // হ্যাশ করা নিরাপদ পাসওয়ার্ড
  image?: string;           // প্রোফাইল ছবি
  role: UserRole;           // ইউজার রোল: admin বা editor
  status: UserStatus;       // অ্যাকাউন্ট স্ট্যাটাস: active বা suspended
  createdAt: Date;
}

