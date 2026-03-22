import { promises as fs } from 'fs';
import path from 'path';
import { Kysely, Migrator, FileMigrationProvider } from 'kysely';
import { db } from './kysely.config';

async function runMigrations() {
  // Use process.cwd() to get the correct path when running with ts-node
  const migrationFolder = path.join(process.cwd(), 'migrations');
  
  const migrator = new Migrator({
    db: db as Kysely<any>,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`✓ Migration "${it.migrationName}" executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`✗ Migration "${it.migrationName}" failed`);
    }
  });

  if (error) {
    console.error('Failed to run migrations:');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
  console.log('✓ All migrations completed successfully');
}

async function rollbackMigration() {
  const migrationFolder = path.join(process.cwd(), 'migrations');
  
  const migrator = new Migrator({
    db: db as Kysely<any>,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder,
    }),
  });

  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`✓ Migration "${it.migrationName}" rolled back successfully`);
    } else if (it.status === 'Error') {
      console.error(`✗ Migration "${it.migrationName}" rollback failed`);
    }
  });

  if (error) {
    console.error('Failed to rollback migration:');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
  console.log('✓ Migration rolled back successfully');
}

const command = process.argv[2];

if (command === 'up') {
  runMigrations();
} else if (command === 'down') {
  rollbackMigration();
} else {
  console.error('Usage: npm run migration:run or npm run migration:rollback');
  process.exit(1);
}
