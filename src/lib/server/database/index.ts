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
} from 'kysely';
import type { Database } from './types';
import * as m1 from './migrations/0001_initial';


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
        name: '0001_initial',
        migration: m1,
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



