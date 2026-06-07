import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Connectivity now lives on the terminal; the station<->station model is removed.
  // Drop the allocation FK/channel columns that referenced station_connectivities first.
  await sql`
    ALTER TABLE allocations
      DROP COLUMN IF EXISTS transmission_connectivity_id,
      DROP COLUMN IF EXISTS reception_connectivity_id,
      DROP COLUMN IF EXISTS transmission_channel_number,
      DROP COLUMN IF EXISTS reception_channel_number
  `.execute(db);

  await db.schema.dropTable('station_connectivities').ifExists().execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Best-effort restore of the station_connectivities table and allocation columns.
  await db.schema
    .createTable('station_connectivities')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('station_id', 'integer', (col) =>
      col.notNull().references('stations.id').onDelete('cascade'),
    )
    .addColumn('connected_station_id', 'integer', (col) =>
      col.notNull().references('stations.id').onDelete('cascade'),
    )
    .addColumn('communication_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('channel_count', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('cr_number', 'varchar(255)')
    .addColumn('transit_network', 'varchar(255)')
    .addColumn('link_station_id', 'integer')
    .addColumn('link_cr_number', 'varchar(255)')
    .addColumn('link_antenna_size', sql`decimal(10,2)`)
    .addColumn('link_frequency_band', 'varchar(255)')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await db.schema
    .alterTable('allocations')
    .addColumn('transmission_connectivity_id', 'integer')
    .addColumn('reception_connectivity_id', 'integer')
    .addColumn('transmission_channel_number', 'integer')
    .addColumn('reception_channel_number', 'integer')
    .execute();
}
