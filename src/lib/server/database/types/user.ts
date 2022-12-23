import type { Generated } from 'kysely';
import type { Session, User, Int8 } from '@lucia-auth/adapter-kysely/dbTypes';

export interface UserTable extends User {
  id: Generated<string>;
  provider_id: string;
  provider: string;
  hashed_password: string | null;
  email: string | null;
  createdAt: Date;
}

export interface SessionTable extends Session {
  id: string;
  user_id: string;
  expires: Int8;
  idle_expires: Int8;
}