import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // The frequency converter (ממיר תדר) concept was removed from satellites.
  await sql`
    ALTER TABLE satellites DROP COLUMN IF EXISTS has_frequency_converter
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('satellites')
    .addColumn('has_frequency_converter', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();
}
