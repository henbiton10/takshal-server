import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Update station_connectivities table
  await db.schema
    .alterTable('station_connectivities')
    .addColumn('link_station_id', 'integer')
    .addColumn('link_cr_number', 'varchar(255)')
    .addColumn('link_antenna_size', 'decimal(10, 2)')
    .addColumn('link_frequency_band', 'varchar(255)')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Revert station_connectivities changes
  await db.schema
    .alterTable('station_connectivities')
    .dropColumn('link_station_id')
    .dropColumn('link_cr_number')
    .dropColumn('link_antenna_size')
    .dropColumn('link_frequency_band')
    .execute();
}
