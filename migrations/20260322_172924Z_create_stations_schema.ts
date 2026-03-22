import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create enum types
  await sql`
    CREATE TYPE organizational_affiliation AS ENUM ('airforce', 'tikshuv')
  `.execute(db);

  await sql`
    CREATE TYPE readiness_status AS ENUM ('ready', 'partly_ready', 'damaged')
  `.execute(db);

  await sql`
    CREATE TYPE satellite_affiliation AS ENUM ('israeli', 'international')
  `.execute(db);

  await sql`
    CREATE TYPE frequency_band AS ENUM ('ka', 'ku')
  `.execute(db);

  // Create stations table
  await db.schema
    .createTable('stations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn(
      'organizational_affiliation',
      sql`organizational_affiliation`,
      (col) => col.notNull(),
    )
    .addColumn('readiness_status', sql`readiness_status`, (col) =>
      col.notNull(),
    )
    .addColumn('notes', 'text')
    .addColumn('is_deleted', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('deleted_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Create index on station name for faster lookups
  await db.schema
    .createIndex('stations_name_idx')
    .on('stations')
    .column('name')
    .execute();

  // Create station_connectivities table
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
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Add constraint to ensure channel_count is positive
  await sql`
    ALTER TABLE station_connectivities 
    ADD CONSTRAINT channel_count_positive 
    CHECK (channel_count > 0)
  `.execute(db);

  // Create index on station_id for faster connectivity lookups
  await db.schema
    .createIndex('station_connectivities_station_id_idx')
    .on('station_connectivities')
    .column('station_id')
    .execute();

  // Create station_antennas table
  await db.schema
    .createTable('station_antennas')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('station_id', 'integer', (col) =>
      col.notNull().references('stations.id').onDelete('cascade'),
    )
    .addColumn('size', sql`decimal(10,2)`, (col) => col.notNull())
    .addColumn('frequency_band', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Create index on station_id for faster antenna lookups
  await db.schema
    .createIndex('station_antennas_station_id_idx')
    .on('station_antennas')
    .column('station_id')
    .execute();

  // Create satellites table
  await db.schema
    .createTable('satellites')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('affiliation', sql`satellite_affiliation`, (col) =>
      col.notNull(),
    )
    .addColumn('has_frequency_converter', 'boolean', (col) => col.notNull())
    .addColumn('readiness_status', sql`readiness_status`, (col) =>
      col.notNull(),
    )
    .addColumn('notes', 'text')
    .addColumn('is_deleted', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('deleted_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Create index on satellite name
  await db.schema
    .createIndex('satellites_name_idx')
    .on('satellites')
    .column('name')
    .execute();

  // Create satellite_associations table (satellite-to-satellite links)
  await db.schema
    .createTable('satellite_associations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('satellite_id', 'integer', (col) =>
      col.notNull().references('satellites.id').onDelete('cascade'),
    )
    .addColumn('associated_satellite_id', 'integer', (col) =>
      col.notNull().references('satellites.id').onDelete('cascade'),
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Create index on satellite_id
  await db.schema
    .createIndex('satellite_associations_satellite_id_idx')
    .on('satellite_associations')
    .column('satellite_id')
    .execute();

  // Create terminal_types table (for upsert logic)
  await db.schema
    .createTable('terminal_types')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Create terminals table
  await db.schema
    .createTable('terminals')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('station_id', 'integer', (col) =>
      col.notNull().references('stations.id').onDelete('cascade'),
    )
    .addColumn('terminal_type_id', 'integer', (col) =>
      col.notNull().references('terminal_types.id'),
    )
    .addColumn('frequency_band', sql`frequency_band`, (col) => col.notNull())
    .addColumn('readiness_status', sql`readiness_status`, (col) =>
      col.notNull(),
    )
    .addColumn('notes', 'text')
    .addColumn('is_deleted', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('deleted_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Create indexes on terminals
  await db.schema
    .createIndex('terminals_station_id_idx')
    .on('terminals')
    .column('station_id')
    .execute();

  await db.schema
    .createIndex('terminals_terminal_type_id_idx')
    .on('terminals')
    .column('terminal_type_id')
    .execute();

  // Create connectivity_types table
  await db.schema
    .createTable('connectivity_types')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Insert default connectivity types
  await db
    .insertInto('connectivity_types')
    .values([{ name: 'fiber_optic' }, { name: 'radio' }, { name: 'satellite' }])
    .execute();

  // Create networks table
  await db.schema
    .createTable('networks')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('terminal_type_id', 'integer', (col) =>
      col.notNull().references('terminal_types.id'),
    )
    .addColumn('connectivity_type_id', 'integer', (col) =>
      col.notNull().references('connectivity_types.id'),
    )
    .addColumn('readiness_status', sql`readiness_status`, (col) =>
      col.notNull(),
    )
    .addColumn('notes', 'text')
    .addColumn('is_deleted', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('deleted_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Create indexes on networks
  await db.schema
    .createIndex('networks_name_idx')
    .on('networks')
    .column('name')
    .execute();

  await db.schema
    .createIndex('networks_terminal_type_id_idx')
    .on('networks')
    .column('terminal_type_id')
    .execute();

  await db.schema
    .createIndex('networks_connectivity_type_id_idx')
    .on('networks')
    .column('connectivity_type_id')
    .execute();

  // Create trigger function to automatically update updated_at timestamp
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql'
  `.execute(db);

  // Create triggers for updated_at
  await sql`
    CREATE TRIGGER update_stations_updated_at 
    BEFORE UPDATE ON stations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column()
  `.execute(db);

  await sql`
    CREATE TRIGGER update_satellites_updated_at 
    BEFORE UPDATE ON satellites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column()
  `.execute(db);

  await sql`
    CREATE TRIGGER update_terminals_updated_at 
    BEFORE UPDATE ON terminals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column()
  `.execute(db);

  await sql`
    CREATE TRIGGER update_networks_updated_at 
    BEFORE UPDATE ON networks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column()
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop triggers
  await sql`DROP TRIGGER IF EXISTS update_networks_updated_at ON networks`.execute(
    db,
  );
  await sql`DROP TRIGGER IF EXISTS update_terminals_updated_at ON terminals`.execute(
    db,
  );
  await sql`DROP TRIGGER IF EXISTS update_satellites_updated_at ON satellites`.execute(
    db,
  );
  await sql`DROP TRIGGER IF EXISTS update_stations_updated_at ON stations`.execute(
    db,
  );
  await sql`DROP FUNCTION IF EXISTS update_updated_at_column()`.execute(db);

  // Drop tables (order matters due to foreign keys)
  await db.schema.dropTable('networks').execute();
  await db.schema.dropTable('connectivity_types').execute();
  await db.schema.dropTable('terminals').execute();
  await db.schema.dropTable('terminal_types').execute();
  await db.schema.dropTable('satellite_associations').execute();
  await db.schema.dropTable('satellites').execute();
  await db.schema.dropTable('station_antennas').execute();
  await db.schema.dropTable('station_connectivities').execute();
  await db.schema.dropTable('stations').execute();

  // Drop enum types
  await sql`DROP TYPE IF EXISTS frequency_band`.execute(db);
  await sql`DROP TYPE IF EXISTS satellite_affiliation`.execute(db);
  await sql`DROP TYPE IF EXISTS readiness_status`.execute(db);
  await sql`DROP TYPE IF EXISTS organizational_affiliation`.execute(db);
}
