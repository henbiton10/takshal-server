import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE allocations ALTER COLUMN tail_number TYPE integer USING tail_number::integer`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE allocations ALTER COLUMN tail_number TYPE varchar(50) USING tail_number::varchar`.execute(db);
}
