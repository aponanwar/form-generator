// app/api/auth/[...nextauth]/route.ts
// NextAuth-এর রুট হ্যান্ডলার (শুধুমাত্র GET ও POST মেথড এক্সপোর্ট করা হয়েছে)

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
