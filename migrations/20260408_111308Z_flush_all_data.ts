import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Delete in correct order to respect foreign key constraints
  
  // Delete allocations first (references operation_orders, terminals, satellites)
  await db.deleteFrom('allocations').execute();
  
  // Delete operation orders (references networks)
  await db.deleteFrom('operation_orders').execute();
  
  // Delete terminals (references stations, terminal_types)
  await db.deleteFrom('terminals').execute();
  
  // Delete station connectivities (references stations)
  await db.deleteFrom('station_connectivities').execute();
  
  // Delete station antennas (references stations)
  await db.deleteFrom('station_antennas').execute();
  
  // Delete stations
  await db.deleteFrom('stations').execute();
  
  // Delete satellites
  await db.deleteFrom('satellites').execute();
  
  // Delete networks (references connectivity_types)
  await db.deleteFrom('networks').execute();
  
  // Delete terminal types
  await db.deleteFrom('terminal_types').execute();
  
  // Delete connectivity types
  await db.deleteFrom('connectivity_types').execute();
  
  console.log('All data flushed successfully');
}

export async function down(db: Kysely<any>): Promise<void> {
  // No down migration - data cannot be restored
  console.log('Cannot restore flushed data');
}
