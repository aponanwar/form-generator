// app/api/upload/route.ts
// এই ফাইলে Cloudinary ক্লাউড স্টোরেজে ছবি ও ফাইল আপলোডের নিরাপদ API রুট তৈরি করা হয়েছে।
// আপলোড শেষে প্রাপ্ত সিকিউর HTTPS লিংকটি ফ্রন্টএন্ডে রিটার্ন করা হয়, যা পরবর্তীতে MongoDB-তে সেভ হবে।

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// ক্লাউডিনারি কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const maxSizeMB = Number(formData.get('maxSizeMB')) || 5;

    if (!file) {
      return NextResponse.json({ error: 'কোনো ফাইল নির্বাচন করা হয়নি' }, { status: 400 });
    }

    // ১. সার্ভার সাইড ফাইল সাইজ ভ্যালিডেশন
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `ফাইলের আকার সর্বোচ্চ ${maxSizeMB} MB হতে পারবে। আপনার ফাইলের আকার: ${(file.size / (1024 * 1024)).toFixed(2)} MB` },
        { status: 400 }
      );
    }

    // ফাইলকে বাফারে রূপান্তর
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ২. ক্লাউডিনারি ক্রেডেনশিয়াল পরীক্ষা
    const hasCloudinaryKeys =
      Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
      Boolean(process.env.CLOUDINARY_API_KEY) &&
      Boolean(process.env.CLOUDINARY_API_SECRET);

    if (hasCloudinaryKeys) {
      // রিয়েল ক্লাউডিনারি আপলোড (Stream upload)
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const isImage = file.type.startsWith('image/');
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'nextform_uploads',
            resource_type: isImage ? 'image' : 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        size: file.size,
        fileName: file.name,
      });
    } else {
      // ডেভ মোডে যদি ক্লাউডিনারি কী সেট না থাকে, তবে টেস্টিংয়ের জন্য নিরাপদ Data URI ব্যবহার করা হচ্ছে
      console.warn('⚠️ Cloudinary keys not set in .env.local. Using Data URI for local preview.');
      const base64 = buffer.toString('base64');
      const dataUri = `data:${file.type || 'application/octet-stream'};base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUri,
        publicId: 'local_preview_' + Date.now(),
        size: file.size,
        fileName: file.name,
        isLocalFallback: true,
      });
    }
  } catch (error: any) {
    console.error('ফাইল আপলোড ত্রুটি:', error);
    return NextResponse.json(
      { error: error.message || 'ফাইল ক্লাউডে আপলোড করা যায়নি।' },
      { status: 500 }
    );
  }
}
