import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("watchlist")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("description", "varchar(255)", (col) => col.notNull().defaultTo(sql`''`))
    .addColumn("is_public", "boolean", (col) => col.notNull().defaultTo(sql`true`))
    .addColumn("is_default_watchlist", "boolean", (col) => col.notNull().defaultTo(sql`false`))
    .addColumn("is_default_towatchlist", "boolean", (col) => col.notNull().defaultTo(sql`false`))
    .addColumn("user_id", "uuid", (col) => col.notNull().references("user.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable("watchlist_item")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("watchlist_id", "uuid", (col) => col.notNull().references("watchlist.id").onDelete("cascade"))
    .addColumn("imdb_item_id", "varchar(255)", (col) => col.notNull().references("imdb_item.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("watchlist").execute();
  await db.schema.dropTable("watchlist_item").execute();
}