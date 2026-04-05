import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Insert Stations
  const stationIds = await db
    .insertInto('stations')
    .values([
      { name: 'תחנת הרצליה', organizational_affiliation: 'airforce', readiness_status: 'ready' },
      { name: 'תחנת תל אביב', organizational_affiliation: 'airforce', readiness_status: 'ready' },
      { name: 'תחנת חיפה', organizational_affiliation: 'tikshuv', readiness_status: 'ready' },
      { name: 'תחנת באר שבע', organizational_affiliation: 'airforce', readiness_status: 'partly_ready' },
      { name: 'תחנת ירושלים', organizational_affiliation: 'tikshuv', readiness_status: 'ready' },
      { name: 'תחנת אילת', organizational_affiliation: 'tikshuv', readiness_status: 'ready' },
      { name: 'תחנת נתניה', organizational_affiliation: 'airforce', readiness_status: 'ready' },
      { name: 'תחנת אשדוד', organizational_affiliation: 'tikshuv', readiness_status: 'partly_ready' },
      { name: 'תחנת רמת גן', organizational_affiliation: 'tikshuv', readiness_status: 'ready' },
      { name: 'תחנת פתח תקווה', organizational_affiliation: 'airforce', readiness_status: 'ready' },
      { name: 'תחנת ראשון לציון', organizational_affiliation: 'airforce', readiness_status: 'ready' },
      { name: 'תחנת חולון', organizational_affiliation: 'tikshuv', readiness_status: 'partly_ready' },
    ])
    .returning('id')
    .execute();

  // Insert Antennas for stations
  for (const station of stationIds) {
    await db
      .insertInto('station_antennas')
      .values([
        { station_id: station.id, size: 2.4, frequency_band: 'ku' },
        { station_id: station.id, size: 3.7, frequency_band: 'ka' },
        { station_id: station.id, size: 4.5, frequency_band: 'ku' },
      ])
      .execute();
  }

  // Insert Connectivities between stations
  for (let i = 0; i < stationIds.length - 1; i++) {
    await db
      .insertInto('station_connectivities')
      .values({
        station_id: stationIds[i].id,
        connected_station_id: stationIds[i + 1].id,
        communication_type: i % 2 === 0 ? 'fiber_optic' : 'radio',
        channel_count: 10 + (i * 5),
      })
      .execute();
  }

  // Insert Satellites
  const satelliteIds = await db
    .insertInto('satellites')
    .values([
      { name: 'עמוס 17', affiliation: 'israeli', has_frequency_converter: true, readiness_status: 'ready' },
      { name: 'עמוס 7', affiliation: 'israeli', has_frequency_converter: true, readiness_status: 'ready' },
      { name: 'טכסט 1', affiliation: 'israeli', has_frequency_converter: false, readiness_status: 'ready' },
      { name: 'אופק 16', affiliation: 'israeli', has_frequency_converter: true, readiness_status: 'ready' },
      { name: 'אינטלסט 33', affiliation: 'international', has_frequency_converter: true, readiness_status: 'ready' },
      { name: 'יוטלסט 4A', affiliation: 'international', has_frequency_converter: true, readiness_status: 'ready' },
      { name: 'ויאסט 2', affiliation: 'international', has_frequency_converter: false, readiness_status: 'partly_ready' },
      { name: 'SES 14', affiliation: 'international', has_frequency_converter: true, readiness_status: 'ready' },
      { name: 'טורקסט 5A', affiliation: 'international', has_frequency_converter: true, readiness_status: 'ready' },
      { name: 'אינמרסט 6', affiliation: 'international', has_frequency_converter: false, readiness_status: 'ready' },
    ])
    .returning('id')
    .execute();

  // Insert Terminal Types
  const terminalTypeIds = await db
    .insertInto('terminal_types')
    .values([
      { name: 'VSAT' },
      { name: 'מובייל' },
      { name: 'קבוע' },
      { name: 'ימי' },
      { name: 'אווירי' },
    ])
    .returning('id')
    .execute();

  // Insert Terminals
  const terminalIds = await db
    .insertInto('terminals')
    .values([
      { name: 'טרמינל 101', station_id: stationIds[0].id, terminal_type_id: terminalTypeIds[0].id, frequency_band: 'ku', readiness_status: 'ready' },
      { name: 'טרמינל 102', station_id: stationIds[0].id, terminal_type_id: terminalTypeIds[1].id, frequency_band: 'ka', readiness_status: 'ready' },
      { name: 'טרמינל 201', station_id: stationIds[1].id, terminal_type_id: terminalTypeIds[2].id, frequency_band: 'ku', readiness_status: 'ready' },
      { name: 'טרמינל 202', station_id: stationIds[1].id, terminal_type_id: terminalTypeIds[0].id, frequency_band: 'ka', readiness_status: 'partly_ready' },
      { name: 'טרמינל 301', station_id: stationIds[2].id, terminal_type_id: terminalTypeIds[3].id, frequency_band: 'ku', readiness_status: 'ready' },
      { name: 'טרמינל 302', station_id: stationIds[2].id, terminal_type_id: terminalTypeIds[1].id, frequency_band: 'ka', readiness_status: 'ready' },
      { name: 'טרמינל 401', station_id: stationIds[3].id, terminal_type_id: terminalTypeIds[4].id, frequency_band: 'ku', readiness_status: 'ready' },
      { name: 'טרמינל 501', station_id: stationIds[4].id, terminal_type_id: terminalTypeIds[2].id, frequency_band: 'ka', readiness_status: 'ready' },
      { name: 'טרמינל 502', station_id: stationIds[4].id, terminal_type_id: terminalTypeIds[0].id, frequency_band: 'ku', readiness_status: 'ready' },
      { name: 'טרמינל 601', station_id: stationIds[5].id, terminal_type_id: terminalTypeIds[3].id, frequency_band: 'ka', readiness_status: 'ready' },
      { name: 'טרמינל 701', station_id: stationIds[6].id, terminal_type_id: terminalTypeIds[1].id, frequency_band: 'ku', readiness_status: 'partly_ready' },
      { name: 'טרמינל 801', station_id: stationIds[7].id, terminal_type_id: terminalTypeIds[2].id, frequency_band: 'ka', readiness_status: 'ready' },
      { name: 'טרמינל 901', station_id: stationIds[8].id, terminal_type_id: terminalTypeIds[0].id, frequency_band: 'ku', readiness_status: 'ready' },
      { name: 'טרמינל 1001', station_id: stationIds[9].id, terminal_type_id: terminalTypeIds[4].id, frequency_band: 'ka', readiness_status: 'ready' },
      { name: 'טרמינל 1101', station_id: stationIds[10].id, terminal_type_id: terminalTypeIds[2].id, frequency_band: 'ku', readiness_status: 'ready' },
      { name: 'טרמינל 1201', station_id: stationIds[11].id, terminal_type_id: terminalTypeIds[1].id, frequency_band: 'ka', readiness_status: 'ready' },
    ])
    .returning('id')
    .execute();

  // Insert Connectivity Types
  const connectivityTypeIds = await db
    .insertInto('connectivity_types')
    .values([
      { name: 'אופטי' },
      { name: 'רדיו' },
      { name: 'לוויני' },
      { name: 'מיקרוגל' },
    ])
    .returning('id')
    .execute();

  // Insert Networks
  await db
    .insertInto('networks')
    .values([
      { name: 'רשת צפון', terminal_type_id: terminalTypeIds[0].id, connectivity_type_id: connectivityTypeIds[0].id, readiness_status: 'ready' },
      { name: 'רשת דרום', terminal_type_id: terminalTypeIds[1].id, connectivity_type_id: connectivityTypeIds[1].id, readiness_status: 'ready' },
      { name: 'רשת מרכז', terminal_type_id: terminalTypeIds[2].id, connectivity_type_id: connectivityTypeIds[2].id, readiness_status: 'ready' },
      { name: 'רשת ים', terminal_type_id: terminalTypeIds[3].id, connectivity_type_id: connectivityTypeIds[0].id, readiness_status: 'partly_ready' },
      { name: 'רשת אוויר', terminal_type_id: terminalTypeIds[4].id, connectivity_type_id: connectivityTypeIds[3].id, readiness_status: 'ready' },
      { name: 'רשת מודיעין', terminal_type_id: terminalTypeIds[0].id, connectivity_type_id: connectivityTypeIds[2].id, readiness_status: 'ready' },
      { name: 'רשת חירום', terminal_type_id: terminalTypeIds[1].id, connectivity_type_id: connectivityTypeIds[1].id, readiness_status: 'ready' },
      { name: 'רשת גיבוי', terminal_type_id: terminalTypeIds[2].id, connectivity_type_id: connectivityTypeIds[0].id, readiness_status: 'ready' },
    ])
    .execute();

  // Insert Operation Orders (March-April 2026)
  const operationOrderIds = await db
    .insertInto('operation_orders')
    .values([
      { name: 'פעולה אלפא', start_date: '2026-03-01', start_time: '08:00:00', end_date: '2026-03-01', end_time: '20:00:00' },
      { name: 'פעולה בטא', start_date: '2026-03-03', start_time: '06:00:00', end_date: '2026-03-03', end_time: '18:00:00' },
      { name: 'פעולה גמא', start_date: '2026-03-05', start_time: '10:00:00', end_date: '2026-03-05', end_time: '22:00:00' },
      { name: 'פעולה דלתא', start_date: '2026-03-08', start_time: '07:00:00', end_date: '2026-03-08', end_time: '19:00:00' },
      { name: 'פעולה זטא', start_date: '2026-03-10', start_time: '09:00:00', end_date: '2026-03-10', end_time: '21:00:00' },
      { name: 'פעולה חטא', start_date: '2026-03-12', start_time: '08:30:00', end_date: '2026-03-12', end_time: '20:30:00' },
      { name: 'פעולה טטא', start_date: '2026-03-15', start_time: '06:30:00', end_date: '2026-03-15', end_time: '18:30:00' },
      { name: 'פעולה יוד', start_date: '2026-03-17', start_time: '10:30:00', end_date: '2026-03-17', end_time: '22:30:00' },
      { name: 'פעולה כף', start_date: '2026-03-20', start_time: '07:30:00', end_date: '2026-03-20', end_time: '19:30:00' },
      { name: 'פעולה למד', start_date: '2026-03-22', start_time: '09:30:00', end_date: '2026-03-22', end_time: '21:30:00' },
      { name: 'פעולה מם', start_date: '2026-03-25', start_time: '08:00:00', end_date: '2026-03-25', end_time: '20:00:00' },
      { name: 'פעולה נון', start_date: '2026-03-27', start_time: '06:00:00', end_date: '2026-03-27', end_time: '18:00:00' },
      { name: 'פעולה סמך', start_date: '2026-03-29', start_time: '10:00:00', end_date: '2026-03-29', end_time: '22:00:00' },
      { name: 'פעולה עין', start_date: '2026-04-01', start_time: '07:00:00', end_date: '2026-04-01', end_time: '19:00:00' },
      { name: 'פעולה פא', start_date: '2026-04-03', start_time: '09:00:00', end_date: '2026-04-03', end_time: '21:00:00' },
      { name: 'פעולה צדי', start_date: '2026-04-05', start_time: '08:30:00', end_date: '2026-04-05', end_time: '20:30:00' },
      { name: 'פעולה קוף', start_date: '2026-04-08', start_time: '06:30:00', end_date: '2026-04-08', end_time: '18:30:00' },
      { name: 'פעולה ריש', start_date: '2026-04-10', start_time: '10:30:00', end_date: '2026-04-10', end_time: '22:30:00' },
      { name: 'פעולה שין', start_date: '2026-04-12', start_time: '07:30:00', end_date: '2026-04-12', end_time: '19:30:00' },
      { name: 'פעולה תו', start_date: '2026-04-15', start_time: '09:30:00', end_date: '2026-04-15', end_time: '21:30:00' },
      { name: 'פעולה חירום 1', start_date: '2026-04-17', start_time: '00:00:00', end_date: '2026-04-17', end_time: '23:59:00' },
      { name: 'פעולה חירום 2', start_date: '2026-04-20', start_time: '00:00:00', end_date: '2026-04-20', end_time: '23:59:00' },
      { name: 'פעולה מיוחדת א', start_date: '2026-04-22', start_time: '08:00:00', end_date: '2026-04-22', end_time: '20:00:00' },
      { name: 'פעולה מיוחדת ב', start_date: '2026-04-25', start_time: '06:00:00', end_date: '2026-04-25', end_time: '18:00:00' },
      { name: 'פעולה מיוחדת ג', start_date: '2026-04-28', start_time: '10:00:00', end_date: '2026-04-28', end_time: '22:00:00' },
    ])
    .returning('id')
    .execute();

  // Get antenna IDs for allocations
  const antennas = await db
    .selectFrom('station_antennas')
    .select(['id', 'station_id', 'frequency_band'])
    .execute();

  // Insert Allocations for each operation order
  for (let i = 0; i < operationOrderIds.length; i++) {
    const opOrder = operationOrderIds[i];
    const numAllocations = 3 + (i % 5); // 3-7 allocations per operation

    for (let j = 0; j < numAllocations; j++) {
      const terminalIdx = (i * numAllocations + j) % terminalIds.length;
      const satelliteIdx = (i + j) % satelliteIds.length;
      const antennaIdx = (i * 2 + j) % antennas.length;
      
      const antenna = antennas[antennaIdx];
      const transmissionConnectivity = await db
        .selectFrom('station_connectivities')
        .select('id')
        .where('station_id', '=', antenna.station_id)
        .executeTakeFirst();

      await db
        .insertInto('allocations')
        .values({
          operation_order_id: opOrder.id,
          order_number: j + 1,
          terminal_id: terminalIds[terminalIdx].id,
          transmission_satellite_id: satelliteIds[satelliteIdx].id,
          transmission_antenna_id: antenna.id,
          transmission_frequency: antenna.frequency_band === 'ku' ? 14.0 + (j * 0.5) : 30.0 + (j * 0.5),
          transmission_connectivity_id: transmissionConnectivity?.id || null,
          transmission_channel_number: 1 + (j * 2),
          reception_satellite_id: satelliteIds[(satelliteIdx + 1) % satelliteIds.length].id,
          reception_antenna_id: antennas[(antennaIdx + 1) % antennas.length].id,
          reception_frequency: antenna.frequency_band === 'ku' ? 12.0 + (j * 0.5) : 20.0 + (j * 0.5),
          reception_connectivity_id: transmissionConnectivity?.id || null,
          reception_channel_number: 2 + (j * 2),
          tail_number: 1000 + (i * 10) + j,
          notes: j % 3 === 0 ? `הקצאה ${j + 1} לפעולה ${opOrder.id}` : null,
          has_conflict: false,
        })
        .execute();
    }
  }

  console.log('✅ Seed data inserted successfully!');
  console.log(`   - ${stationIds.length} stations`);
  console.log(`   - ${satelliteIds.length} satellites`);
  console.log(`   - ${terminalIds.length} terminals`);
  console.log(`   - ${operationOrderIds.length} operation orders`);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Delete in reverse order due to foreign key constraints
  await db.deleteFrom('allocations').execute();
  await db.deleteFrom('operation_orders').execute();
  await db.deleteFrom('networks').execute();
  await db.deleteFrom('terminals').execute();
  await db.deleteFrom('terminal_types').execute();
  await db.deleteFrom('connectivity_types').execute();
  await db.deleteFrom('satellites').execute();
  await db.deleteFrom('station_connectivities').execute();
  await db.deleteFrom('station_antennas').execute();
  await db.deleteFrom('stations').execute();
}
