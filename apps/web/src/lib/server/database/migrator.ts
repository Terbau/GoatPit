import * as path from 'path';

import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect
} from 'kysely';

import type { Database } from './types';
import { promises as fs } from 'fs';
import pg from 'pg';

async function migrateToLatest() {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        host: 'localhost',
        port: 5432,
        database: 'my_database',
        user: 'my_user',
        password: 'my_password',
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: './migrations',
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

  await db.destroy();
}

