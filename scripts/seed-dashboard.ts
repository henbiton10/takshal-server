import * as dotenv from 'dotenv';
import path from 'path';

// Load .env BEFORE importing db
dotenv.config({ path: path.resolve(__dirname, '../.env') });
process.env.ENVIRONMENT = 'local';

import { db } from '../src/database/kysely.config';

async function seed() {
  console.log('Starting MASSIVE seed process (typed safe)...');

  try {
    // 1. Clean existing data
    await db.deleteFrom('allocations').execute();
    await db.deleteFrom('operation_orders').execute();
    await db.deleteFrom('terminals').execute();
    await db.deleteFrom('terminal_types').execute();
    await db.deleteFrom('station_antennas').execute();
    await db.deleteFrom('satellites').execute();
    await db.deleteFrom('stations').execute();
    await db.deleteFrom('networks').execute();
    await db.deleteFrom('connectivity_types').execute();

    console.log('✓ Cleaned existing data');

    // 2. Seed Connectivity & Terminal Types
    await db.insertInto('connectivity_types').values([{ name: 'RF3' }, { name: 'RF12' }, { name: 'RFO' }] as any).execute();
    const terminalTypes = await db.insertInto('terminal_types').values([{ name: 'Fixed' }, { name: 'Mobile' }, { name: 'SOTM' }] as any).returning(['id', 'name']).execute();
    const fixedId = terminalTypes[0].id;

    // 3. Seed 10+ Stations
    const stationNames = [
      'תחנה צפונית', 'תחנה דרומית', 'תחנת מרכז', 'תחנת הנגב', 'תחנת הגליל',
      'תחנת בקעה', 'תחנת הערבה', 'תחנת אילת', 'תחנת חיפה', 'תחנת ירושלים'
    ];
    const stations = await db.insertInto('stations')
      .values(stationNames.map((name, i) => ({
        name,
        organizational_affiliation: i % 2 === 0 ? 'airforce' : 'tikshuv',
        readiness_status: 'ready'
      })) as any)
      .returning(['id', 'name'])
      .execute();

    console.log('✓ Seeded 10 Stations');

    // 4. Seed 10+ Antennas
    const antennas = await db.insertInto('station_antennas')
      .values(stations.map((s, i) => ({
        station_id: s.id,
        size: i % 2 === 0 ? 2.4 : 3.7,
        frequency_band: i % 2 === 0 ? 'ka' : 'ku'
      })) as any)
      .returning(['id', 'station_id', 'frequency_band'])
      .execute();
    
    console.log('✓ Seeded 10 Antennas');

    // 5. Seed 12 Satellites
    const satellites = await db.insertInto('satellites')
      .values([
        { name: 'AMOS-6', affiliation: 'israeli', has_frequency_converter: true, readiness_status: 'ready' },
        { name: 'AMOS-17', affiliation: 'israeli', has_frequency_converter: true, readiness_status: 'ready' },
        { name: 'AMOS-18', affiliation: 'international', has_frequency_converter: true, readiness_status: 'ready' },
        { name: 'AMOS-19', affiliation: 'international', has_frequency_converter: true, readiness_status: 'ready' },
        { name: 'AMOS-20', affiliation: 'international', has_frequency_converter: true, readiness_status: 'ready' },
        { name: 'AMOS-21', affiliation: 'israeli', has_frequency_converter: true, readiness_status: 'ready' },
        { name: 'AMOS-22', affiliation: 'israeli', has_frequency_converter: true, readiness_status: 'ready' },
        { name: 'INTELSAT 1', affiliation: 'international', has_frequency_converter: false, readiness_status: 'ready' },
        { name: 'INTELSAT 2', affiliation: 'international', has_frequency_converter: false, readiness_status: 'ready' },
        { name: 'INMARSAT', affiliation: 'international', has_frequency_converter: true, readiness_status: 'ready' },
        { name: 'O3B', affiliation: 'international', has_frequency_converter: false, readiness_status: 'ready' },
        { name: 'IRIDIUM', affiliation: 'international', has_frequency_converter: true, readiness_status: 'ready' }
      ] as any)
      .returning(['id', 'name'])
      .execute();

    console.log('✓ Seeded 12 Satellites');

    // 6. Seed 10+ Terminals
    const terminals = await db.insertInto('terminals')
      .values(stations.map((s, i) => ({
        name: `טרמינל-${s.name.split(' ')[1] || i}`,
        station_id: s.id,
        terminal_type_id: fixedId,
        frequency_band: i % 2 === 0 ? 'ka' : 'ku',
        readiness_status: 'ready'
      })) as any)
      .returning(['id', 'station_id', 'frequency_band'])
      .execute();

    console.log('✓ Seeded 10 Terminals');

    // 7. Seed 10 Operation Orders (overlapping)
    const now = new Date();
    const orderValues: any[] = [];

    for (let i = 0; i < 10; i++) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      const end = new Date(now);
      end.setDate(now.getDate() + 10 + i);

      orderValues.push({
        name: `מבצע מבצעי ${i + 1}`,
        start_date: start.toISOString().split('T')[0],
        start_time: '00:00:00',
        end_date: end.toISOString().split('T')[0],
        end_time: '23:59:59'
      });
    }

    const orders = await db.insertInto('operation_orders')
      .values(orderValues as any)
      .returning('id')
      .execute();

    console.log('✓ Seeded 10 Operation Orders');

    // 8. Seed Allocations (dense)
    const allocations: any[] = [];
    for (let i = 0; i < terminals.length; i++) {
        const terminal = terminals[i];
        const satellite = satellites[i % satellites.length];
        const antenna = antennas.find(a => a.station_id === terminal.station_id && a.frequency_band === terminal.frequency_band);
        const order = orders[i % orders.length];

        if (antenna && order) {
            allocations.push({
                operation_order_id: order.id,
                order_number: 1000 + i,
                terminal_id: terminal.id,
                transmission_satellite_id: satellite.id,
                transmission_antenna_id: antenna.id,
                transmission_frequency: 30.0 + i,
                reception_satellite_id: satellite.id,
                reception_antenna_id: antenna.id,
                reception_frequency: 20.0 + i
            });
        }
    }

    if (allocations.length > 0) {
        await db.insertInto('allocations').values(allocations).execute();
        console.log(`✓ Seeded ${allocations.length} Allocations`);
    }

    // 9. Seed 10 Networks
    const connTypes = await db.selectFrom('connectivity_types').selectAll().execute();
    const networks: any[] = [];

    for (let i = 0; i < 10; i++) {
      networks.push({
        name: `רשת ${String.fromCharCode(1488 + i)}`, // רשת א, רשת ב...
        terminal_type_id: terminalTypes[i % terminalTypes.length].id,
        connectivity_type_id: connTypes[i % connTypes.length].id,
        readiness_status: 'ready'
      });

    }
    await db.insertInto('networks').values(networks as any).execute();
    console.log('✓ Seeded 10 Networks');
    
    console.log('✓ MASSIVE seeding completed successfully!');

  } catch (error) {
    console.error('✗ Seeding failed:', error);
  } finally {
    await db.destroy();
  }
}

seed();
