import * as dotenv from 'dotenv';
import path from 'path';

// Load .env BEFORE importing db
dotenv.config({ path: path.resolve(__dirname, '../.env') });
process.env.ENVIRONMENT = 'local';

import { db } from '../src/database/kysely.config';

async function clean() {
  console.log('Starting database cleaning process...');

  try {
    // Order matters due to foreign key constraints if CASCADE is not used
    // 1. Transactions/Allocations first
    console.log('Cleaning allocations...');
    await db.deleteFrom('allocations').execute();
    
    console.log('Cleaning operation orders...');
    await db.deleteFrom('operation_orders').execute();
    
    // 2. Primary entities
    console.log('Cleaning terminals and networks...');
    await db.deleteFrom('terminals').execute();
    await db.deleteFrom('networks').execute();
    
    // 3. Station and Satellite details
    console.log('Cleaning station details...');
    await db.deleteFrom('station_antennas').execute();
    await db.deleteFrom('station_connectivities').execute();
    
    console.log('Cleaning satellite associations...');
    await db.deleteFrom('satellite_associations').execute();
    
    // 4. Base entities
    console.log('Cleaning stations and satellites...');
    await db.deleteFrom('stations').execute();
    await db.deleteFrom('satellites').execute();
    
    // 5. Lookups/Catalogues
    console.log('Cleaning terminal types and connectivity types...');
    await db.deleteFrom('terminal_types').execute();
    await db.deleteFrom('connectivity_types').execute();

    console.log('✓ Database cleaned successfully!');

  } catch (error) {
    console.error('✗ Cleaning failed:', error);
  } finally {
    await db.destroy();
  }
}

clean();
