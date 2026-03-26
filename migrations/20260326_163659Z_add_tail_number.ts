import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('allocations')
    .addColumn('tail_number', 'varchar(50)')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('allocations')
    .dropColumn('tail_number')
    .execute();
}
