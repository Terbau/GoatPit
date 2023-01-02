import type { SessionSchema, UserSchema } from "lucia-auth/types";
import type { Selectable } from "kysely";
import type { Session, User } from "../database/types/user"

export const convertToUserSchema = (user: Selectable<User>): UserSchema => {
  return {
    id: user.id,
    provider_id: user.providerId,
    provider: user.provider,
    hashed_password: user.hashedPassword,
    email: user.email,
    created_at: user.createdAt,
  };
}

export const convertToSessionSchema = (session: Selectable<Session>): SessionSchema => {
  return {
    id: session.id,
    user_id: session.userId,
    expires: Number(session.expires),
    idle_expires: Number(session.idleExpires),
  };
}