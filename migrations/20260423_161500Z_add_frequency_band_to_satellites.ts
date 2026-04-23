import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('satellites')
    .addColumn('frequency_band', sql`frequency_band`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('satellites')
    .dropColumn('frequency_band')
    .execute();
}
