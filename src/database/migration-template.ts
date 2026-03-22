import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Migration code here
  // Example:
  // await db.schema
  //   .createTable('users')
  //   .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
  //   .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
  //   .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
  //   .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Rollback code here
  // Example:
  // await db.schema.dropTable('users').execute();
}
