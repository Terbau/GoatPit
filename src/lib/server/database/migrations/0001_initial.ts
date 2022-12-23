import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("user")
    .addColumn("id", "varchar(255)", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("provider_id", "varchar(255)", (col) => col.unique().notNull())
    .addColumn("provider", "varchar(255)", (col) => col.notNull())
    .addColumn("hashed_password", "varchar(255)")
    .addColumn("email", "varchar(255)", (col) => col.unique())
    .addColumn("createdAt", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable("session")
    .addColumn("id", "varchar(255)", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()::text`))
    .addColumn("user_id", "varchar(255)", (col) => col.notNull().references("user.id").onDelete("cascade"))
    .addColumn("expires", "bigint", (col) => col.notNull())
    .addColumn("idle_expires", "bigint", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("session").execute();
  await db.schema.dropTable("user").execute();
}