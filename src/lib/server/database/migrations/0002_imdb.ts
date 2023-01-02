import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("imdb_item")
    .addColumn("id", "varchar(255)", (col) => col.primaryKey())
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("plot", "text", (col) => col.notNull())
    .addColumn("runtime", "integer")
    .addColumn("year_released", "integer")
    .addColumn("year_ended", "integer")
    .addColumn("released_at", "timestamptz", (col) => col.notNull())
    .addColumn("numberOfEpisodes", "integer", (col) => col.notNull())
    .addColumn("certificate", "varchar(255)", (col) => col.notNull())
    .addColumn("star_rating", "float4", (col) => col.notNull())
    .addColumn("votes", "integer", (col) => col.notNull())
    .addColumn("image_url", "varchar(255)", (col) => col.notNull())
    .addColumn("type", "varchar(255)", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();
  
  await db.schema
    .createTable("imdb_creator")
    .addColumn("id", "varchar(255)", (col) => col.primaryKey())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable("imdb_star")
    .addColumn("id", "varchar(255)", (col) => col.primaryKey())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable("imdb_creator_filmography")
    .addColumn("creator_id", "varchar(255)", (col) => col.notNull().references("imdb_creator.id").onDelete("cascade"))
    .addColumn("item_id", "varchar(255)", (col) => col.notNull().references("imdb_item.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createTable("imdb_star_filmography")
    .addColumn("star_id", "varchar(255)", (col) => col.notNull().references("imdb_star.id").onDelete("cascade"))
    .addColumn("item_id", "varchar(255)", (col) => col.notNull().references("imdb_item.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createTable("imdb_genre")
    .addColumn("name", "varchar(255)", (col) => col.primaryKey())
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn("updated_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable("imdb_item_genre")
    .addColumn("item_id", "varchar(255)", (col) => col.notNull().references("imdb_item.id").onDelete("cascade"))
    .addColumn("genre_name", "varchar(255)", (col) => col.notNull().references("imdb_genre.name").onDelete("cascade"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("imdb_creator").execute();
  await db.schema.dropTable("imdb_star").execute();
  await db.schema.dropTable("imdb_creator_filmography").execute();
  await db.schema.dropTable("imdb_star_filmography").execute();
  await db.schema.dropTable("imdb_genre").execute();
  await db.schema.dropTable("imdb_item_genre").execute();
  await db.schema.dropTable("imdb_item").execute();
}