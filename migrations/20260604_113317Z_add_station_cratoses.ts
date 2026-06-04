import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Remove the antenna name field (replaced by the CRATOS concept on the station).
  await sql`
    ALTER TABLE station_antennas DROP COLUMN IF EXISTS name
  `.execute(db);

  // A CRATOS is a numbered (1-10) communication component owned by a station.
  await db.schema
    .createTable('station_cratoses')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('station_id', 'integer', (col) =>
      col.notNull().references('stations.id').onDelete('cascade'),
    )
    .addColumn('number', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Each CRATOS number is unique within a station.
  await db.schema
    .createIndex('station_cratoses_station_id_number_idx')
    .on('station_cratoses')
    .columns(['station_id', 'number'])
    .unique()
    .execute();

  // Guard the 1-10 range at the database level.
  await sql`
    ALTER TABLE station_cratoses
    ADD CONSTRAINT station_cratoses_number_range
    CHECK (number >= 1 AND number <= 10)
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('station_cratoses').execute();

  // Restore the antenna name field.
  await db.schema
    .alterTable('station_antennas')
    .addColumn('name', 'varchar(255)')
    .execute();
}
