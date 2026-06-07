import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    handle: string;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      handle: string;
      role: Role;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    handle: string;
    role: Role;
  }
}
