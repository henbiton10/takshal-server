import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create operation_orders table
  await db.schema
    .createTable('operation_orders')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('time', 'time', (col) => col.notNull())
    .addColumn('is_deleted', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Create index on operation_orders name
  await db.schema
    .createIndex('operation_orders_name_idx')
    .on('operation_orders')
    .column('name')
    .execute();

  // Create allocations table
  await db.schema
    .createTable('allocations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('operation_order_id', 'integer', (col) =>
      col.notNull().references('operation_orders.id').onDelete('cascade'),
    )
    .addColumn('parent_allocation_id', 'integer', (col) =>
      col.references('allocations.id').onDelete('cascade'),
    )
    .addColumn('order_number', 'integer', (col) => col.notNull())
    .addColumn('sub_order_number', 'integer')
    .addColumn('terminal_id', 'integer', (col) =>
      col.notNull().references('terminals.id'),
    )
    .addColumn('transmission_satellite_id', 'integer', (col) =>
      col.notNull().references('satellites.id'),
    )
    .addColumn('transmission_antenna_id', 'integer', (col) =>
      col.notNull().references('station_antennas.id'),
    )
    .addColumn('transmission_frequency', sql`decimal(10,2)`, (col) =>
      col.notNull(),
    )
    .addColumn('reception_satellite_id', 'integer', (col) =>
      col.notNull().references('satellites.id'),
    )
    .addColumn('reception_antenna_id', 'integer', (col) =>
      col.notNull().references('station_antennas.id'),
    )
    .addColumn('reception_frequency', sql`decimal(10,2)`, (col) =>
      col.notNull(),
    )
    .addColumn('transmission_connectivity_id', 'integer', (col) =>
      col.references('station_connectivities.id'),
    )
    .addColumn('reception_connectivity_id', 'integer', (col) =>
      col.references('station_connectivities.id'),
    )
    .addColumn('transmission_channel_number', 'integer')
    .addColumn('reception_channel_number', 'integer')
    .addColumn('notes', 'text')
    .addColumn('has_conflict', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn('conflict_ignored', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn('is_deleted', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Create indexes on allocations
  await db.schema
    .createIndex('allocations_operation_order_id_idx')
    .on('allocations')
    .column('operation_order_id')
    .execute();

  await db.schema
    .createIndex('allocations_parent_allocation_id_idx')
    .on('allocations')
    .column('parent_allocation_id')
    .execute();

  await db.schema
    .createIndex('allocations_terminal_id_idx')
    .on('allocations')
    .column('terminal_id')
    .execute();

  // Create trigger for updated_at on operation_orders
  await sql`
    CREATE TRIGGER update_operation_orders_updated_at 
    BEFORE UPDATE ON operation_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column()
  `.execute(db);

  // Create trigger for updated_at on allocations
  await sql`
    CREATE TRIGGER update_allocations_updated_at 
    BEFORE UPDATE ON allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop triggers
  await sql`DROP TRIGGER IF EXISTS update_allocations_updated_at ON allocations`.execute(
    db,
  );
  await sql`DROP TRIGGER IF EXISTS update_operation_orders_updated_at ON operation_orders`.execute(
    db,
  );

  // Drop tables
  await db.schema.dropTable('allocations').execute();
  await db.schema.dropTable('operation_orders').execute();
}
