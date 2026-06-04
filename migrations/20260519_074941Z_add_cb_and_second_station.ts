import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // 1. Add 'cb' to the existing frequency_band enum type
  await sql`ALTER TYPE frequency_band ADD VALUE 'cb'`.execute(db);

  // 2. Add second_station_id to terminals referencing stations.id
  await db.schema
    .alterTable('terminals')
    .addColumn('second_station_id', 'integer', (col) =>
      col.references('stations.id').onDelete('set null'),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // 1. Remove second_station_id column
  await db.schema
    .alterTable('terminals')
    .dropColumn('second_station_id')
    .execute();

  // Note: PostgreSQL does not easily support removing an enum value, so that remains altered.
}
