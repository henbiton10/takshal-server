import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Terminal-level additions: bandwidth (MHz) and the associated satellite.
  await db.schema
    .alterTable('terminals')
    .addColumn('bandwidth', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('satellite_id', 'integer', (col) =>
      col.references('satellites.id').onDelete('set null'),
    )
    .execute();

  // Stations now live per-connectivity row, so the terminal's own station is optional.
  await db.schema
    .alterTable('terminals')
    .alterColumn('station_id', (col) => col.dropNotNull())
    .execute();

  // A terminal can have multiple connectivities. Each has a "terminal side"
  // (station + antenna + connection type + transit network + cratos) and an
  // optional "antenna side" (station + antenna + the same cratos number).
  await db.schema
    .createTable('terminal_connectivities')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('terminal_id', 'integer', (col) =>
      col.notNull().references('terminals.id').onDelete('cascade'),
    )
    .addColumn('order_index', 'integer', (col) => col.notNull().defaultTo(0))
    // Terminal side
    .addColumn('station_id', 'integer', (col) =>
      col.references('stations.id').onDelete('set null'),
    )
    .addColumn('antenna_id', 'integer', (col) =>
      col.references('station_antennas.id').onDelete('set null'),
    )
    .addColumn('connection_type', 'varchar(255)')
    .addColumn('transit_network', 'varchar(255)')
    .addColumn('cratos_number', 'integer')
    // Antenna side (optional)
    .addColumn('antenna_side_station_id', 'integer', (col) =>
      col.references('stations.id').onDelete('set null'),
    )
    .addColumn('antenna_side_antenna_id', 'integer', (col) =>
      col.references('station_antennas.id').onDelete('set null'),
    )
    .addColumn('antenna_side_cratos_number', 'integer')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await db.schema
    .createIndex('terminal_connectivities_terminal_id_idx')
    .on('terminal_connectivities')
    .column('terminal_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('terminal_connectivities').execute();

  await db.schema
    .alterTable('terminals')
    .dropColumn('bandwidth')
    .dropColumn('satellite_id')
    .execute();

  // Restore NOT NULL on station_id (assumes no null rows exist on rollback).
  await db.schema
    .alterTable('terminals')
    .alterColumn('station_id', (col) => col.setNotNull())
    .execute();
}
