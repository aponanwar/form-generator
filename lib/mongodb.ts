// lib/mongodb.ts
// এই ফাইলে অফিসিয়াল MongoDB Raw Driver ব্যবহার করে কানেকশন পুলিং তৈরি করা হয়েছে।
// Vercel Serverless ফাংশনে যাতে প্রতিটি রিকোয়েস্টে নতুন কানেকশন খুলে ডেটাবেজ ক্র্যাশ না হয়,
// সেজন্য এখানে গ্লোবাল ক্যাশিং প্যাটার্ন ব্যবহার করা হয়েছে।

import { MongoClient, Db } from 'mongodb';

// এনভায়রনমেন্ট ভেরিয়েবল পরীক্ষা করা হচ্ছে
if (!process.env.MONGODB_URI) {
  throw new Error('অনুগ্রহ করে আপনার .env.local ফাইলে MONGODB_URI যোগ করুন।');
}

const uri = process.env.MONGODB_URI;

// র মঙ্গোডিবি ক্লায়েন্ট কনফিগারেশন
const options = {
  maxPoolSize: 10, // সার্ভারলেসের জন্য কানেকশন পুলে সর্বোচ্চ ১০টি কানেকশন কার্যকর থাকবে
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// গ্লোবাল ভেরিয়েবলের টাইপ ডিফাইন করা হচ্ছে
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  // ডেভেলপমেন্ট মোডে হট-রিলোড হলেও পূর্বের কানেকশন প্রমিজ যেন বজায় থাকে
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // প্রোডাকশনে (Vercel) কানেকশন তৈরি
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * র মঙ্গোডিবি ডেটাবেজ অবজেক্ট রিটার্ন করার সহায়ক ফাংশন
 * @returns {Promise<Db>}
 */
export async function getDatabase(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db();
}

export default clientPromise;
