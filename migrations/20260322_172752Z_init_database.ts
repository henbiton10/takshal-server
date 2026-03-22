import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Enable UUID extension for PostgreSQL
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);
  
  // Enable pgcrypto for additional cryptographic functions
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Note: Extensions are typically not dropped in down migrations
  // as they might be used by other parts of the system
  await sql`DROP EXTENSION IF EXISTS "pgcrypto"`.execute(db);
  await sql`DROP EXTENSION IF EXISTS "uuid-ossp"`.execute(db);
}
