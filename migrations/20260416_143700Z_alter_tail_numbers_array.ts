import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE allocations RENAME COLUMN tail_number TO tail_numbers`.execute(db);
  // Cast existing integer column to integer[]
  await sql`ALTER TABLE allocations ALTER COLUMN tail_numbers TYPE integer[] USING CASE WHEN tail_numbers IS NOT NULL THEN ARRAY[tail_numbers] ELSE NULL END`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Cast integer[] back to integer by taking the first element
  await sql`ALTER TABLE allocations ALTER COLUMN tail_numbers TYPE integer USING CASE WHEN tail_numbers IS NOT NULL AND array_length(tail_numbers, 1) > 0 THEN tail_numbers[1] ELSE NULL END`.execute(db);
  await sql`ALTER TABLE allocations RENAME COLUMN tail_numbers TO tail_number`.execute(db);
}
