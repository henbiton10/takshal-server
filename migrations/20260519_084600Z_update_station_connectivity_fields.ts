import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('station_connectivities')
    .addColumn('cr_number', 'varchar(255)')
    .addColumn('transit_network', 'varchar(255)')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('station_connectivities')
    .dropColumn('cr_number')
    .dropColumn('transit_network')
    .execute();
}
