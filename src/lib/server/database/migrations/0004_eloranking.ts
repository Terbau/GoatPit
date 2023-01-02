import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("item_elo")
    .addColumn("user_id", "uuid", (col) => col.notNull().references("user.id").onDelete("cascade"))
    .addColumn("imdb_item_id", "varchar(255)", (col) => col.notNull().references("imdb_item.id").onDelete("cascade"))
    .addColumn("elo_rating", "real", (col) => col.notNull().defaultTo(sql`1000`))
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable("item_elo_matchup")
    .addColumn("user_id", "uuid", (col) => col.notNull().references("user.id").onDelete("cascade"))
    .addColumn("imdb_item_id1", "varchar(255)", (col) => col.notNull().references("imdb_item.id").onDelete("cascade"))
    .addColumn("imdb_item_id2", "varchar(255)", (col) => col.notNull().references("imdb_item.id").onDelete("cascade"))
    .addColumn("winner_imdb_item_id", "varchar(255)", (col) => col.notNull().references("imdb_item.id").onDelete("cascade"))
    .addColumn("imdb_genre_name", "varchar(255)", (col) => col.references("imdb_genre.name").onDelete("cascade"))
    .addColumn("started_at", "timestamptz", (col) => col.notNull())
    .addColumn("ended_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("item_elo").execute();
  await db.schema.dropTable("item_elo_matchup").execute();
}