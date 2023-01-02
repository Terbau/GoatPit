import * as path from 'path';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import {
  type MigrationProvider,
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect,
  type Migration,
  CamelCasePlugin,
} from 'kysely';
import type { Database } from './types';
import * as m1 from './migrations/0001_user_session';
import * as m2 from './migrations/0002_imdb';
import * as m3 from './migrations/0003_watchlist';
import * as m4 from './migrations/0004_eloranking';


export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: 'localhost',
      port: 5434,
      database: 'dev',
      user: 'postgres',
      password: 'postgres',
    }),
  }),
  plugins: [new CamelCasePlugin()]
});

// Use automatic database migrations to create the database schema.
// Need to fix so its actually automatic... Now it just overrides all the time.
(async () => {
  type CustomMigration = {
    name: string;
    migration: Migration;
  }

  class CustomMigrationProvider implements MigrationProvider {
    readonly #migrations: CustomMigration[];

    constructor(migrations: CustomMigration[]) {
      this.#migrations = migrations;
    }

    async getMigrations(): Promise<Record<string, Migration>> {
      const migrations: Record<string, Migration> = {};
      
      for (const migration of this.#migrations) {
        migrations[migration.name] = migration.migration;
      }

      return migrations;
    }
  }

  const migrator = new Migrator({
    db,
    provider: new CustomMigrationProvider([
      {
        name: '0001_user_session',
        migration: m1,
      },
      {
        name: '0002_imdb',
        migration: m2,
      },
      {
        name: '0003_watchlist',
        migration: m3,
      },
      {
        name: '0004_eloranking',
        migration: m4,
      }
    ]),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  })

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }
})();

(async () => {
  return;

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: new URL('../database/migrations', import.meta.url).pathname,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  })

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }
})();



