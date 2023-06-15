import type { Generated } from 'kysely';
import type { Int8 } from '@lucia-auth/adapter-kysely/dbTypes';

export interface User {
  id: Generated<string>;
  providerId: string;
  provider: string;
  hashedPassword: string | null;
  email: string;
  createdAt: Generated<Date>;
}

export interface Session {
  id: string;
  userId: string;
  expires: Int8;
  idleExpires: Int8;
}