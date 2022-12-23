import type { DB } from "@lucia-auth/adapter-kysely/dbTypes";
import type { SessionTable, UserTable } from "./user";

export interface Database extends DB {
  user: UserTable;
  session: SessionTable;
}