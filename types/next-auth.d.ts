import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'editor';
      status: 'active' | 'suspended';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: 'admin' | 'editor';
    status?: 'active' | 'suspended';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'admin' | 'editor';
    status?: 'active' | 'suspended';
  }
}
