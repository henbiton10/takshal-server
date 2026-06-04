import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('satellites')
    .alterColumn('name', (col) => col.dropNotNull())
    .addColumn('sky_point', 'varchar(255)')
    .addColumn('bandwidth', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('screenshots', 'jsonb')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('satellites')
    .alterColumn('name', (col) => col.setNotNull())
    .dropColumn('sky_point')
    .dropColumn('bandwidth')
    .dropColumn('screenshots')
    .execute();
}
