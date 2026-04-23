# Takshal Database Schema

Complete schema for the Takshal communication planning system.

## Enums

```sql
organizational_affiliation: 'airforce' | 'tikshuv'
readiness_status: 'ready' | 'partly_ready' | 'damaged'
satellite_affiliation: 'israeli' | 'international'
frequency_band: 'ka' | 'ku'
```

## Tables

### 1. Stations (תחנות קרקעיות)

Ground stations with organizational affiliation.

```
stations
├── id (serial, PK)
├── name (varchar, unique, required)
├── organizational_affiliation (enum, required)
├── readiness_status (enum, required)
├── notes (text, nullable)
├── is_deleted (boolean, default: false)
├── deleted_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp, auto-update)
```

**Related tables:**
- `station_antennas` - Antennas at this station
- `station_connectivities` - Connections to other stations
- `terminals` - Terminals at this station

### 2. Station Antennas

```
station_antennas
├── id (serial, PK)
├── station_id (integer, FK → stations.id, cascade)
├── size (decimal(10,2), required)
├── frequency_band (varchar, required)
└── created_at (timestamp)
```

### 3. Station Connectivities

Station-to-station connections.

```
station_connectivities
├── id (serial, PK)
├── station_id (integer, FK → stations.id, cascade)
├── connected_station_id (integer, FK → stations.id, cascade)
├── communication_type (varchar, required)
├── channel_count (integer, default: 1, CHECK > 0)
└── created_at (timestamp)
```

### 4. Satellites (לווינים)

Communication satellites.

```
satellites
├── id (serial, PK)
├── name (varchar, unique, required)
├── affiliation (enum: israeli/international, required)
├── has_frequency_converter (boolean, required)
├── readiness_status (enum, required)
├── notes (text, nullable)
├── is_deleted (boolean, default: false)
├── deleted_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp, auto-update)
```

**Related tables:**
- `satellite_associations` - Links to other satellites

### 5. Satellite Associations

Satellite-to-satellite links.

```
satellite_associations
├── id (serial, PK)
├── satellite_id (integer, FK → satellites.id, cascade)
├── associated_satellite_id (integer, FK → satellites.id, cascade)
└── created_at (timestamp)
```

### 6. Terminal Types

Dynamic terminal type catalog (supports upsert).

```
terminal_types
├── id (serial, PK)
├── name (varchar, unique, required)
└── created_at (timestamp)
```

### 7. Terminals (טרמינלים)

Communication terminals attached to ground stations.

```
terminals
├── id (serial, PK)
├── name (varchar, unique, required)
├── station_id (integer, FK → stations.id, cascade)
├── terminal_type_id (integer, FK → terminal_types.id)
├── frequency_band (enum: ka/ku, required)
├── readiness_status (enum, required)
├── notes (text, nullable)
├── is_deleted (boolean, default: false)
├── deleted_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp, auto-update)
```

### 8. Connectivity Types

Catalog of connection methods.

```
connectivity_types
├── id (serial, PK)
├── name (varchar, unique, required)
└── created_at (timestamp)

Default values: 'fiber_optic', 'radio', 'satellite'
```

### 9. Networks (רשתות)

Communication networks.

```
networks
├── id (serial, PK)
├── name (varchar, unique, required)
├── terminal_type_id (integer, FK → terminal_types.id)
├── connectivity_type_id (integer, FK → connectivity_types.id)
├── readiness_status (enum, required)
├── notes (text, nullable)
├── is_deleted (boolean, default: false)
├── deleted_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp, auto-update)
```

## Relationships

```
Stations (1) ──→ (*) Terminals
Stations (1) ──→ (*) Station Antennas
Stations (*) ←→ (*) Stations (via station_connectivities)

Satellites (*) ←→ (*) Satellites (via satellite_associations)

Terminals (*) ──→ (1) Terminal Types
Terminals (*) ──→ (1) Stations

Networks (*) ──→ (1) Terminal Types
Networks (*) ──→ (1) Connectivity Types
```

## Soft Delete Pattern

All major entities (stations, satellites, terminals, networks) support soft delete:
- `is_deleted` - Boolean flag (default: false)
- `deleted_at` - Timestamp when soft-deleted

Queries should filter `WHERE is_deleted = false` by default.

## Auto-Update Triggers

Tables with `updated_at` columns have triggers that automatically update the timestamp on any UPDATE operation:
- stations
- satellites
- terminals
- networks

## Indexes

Indexes are created on:
- All unique name columns
- Frequently queried fields (station_id, terminal_type_id, etc.)

### 10. Operation Orders

```
operation_orders
├── id (serial, PK)
├── name (varchar, required)
├── start_date (date, required)
├── start_time (time, required)
├── end_date (date, required)
├── end_time (time, required)
├── is_deleted (boolean, default: false)
├── deleted_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp, auto-update)
```

### 11. Allocations

```
allocations
├── id (serial, PK)
├── operation_order_id (integer, FK → operation_orders.id)
├── parent_allocation_id (integer, FK → allocations.id, nullable)
├── order_number (integer, required)
├── sub_order_number (integer, nullable)
├── terminal_id (integer, FK → terminals.id)
├── transmission_satellite_id (integer, FK → satellites.id)
├── transmission_antenna_id (integer, FK → station_antennas.id)
├── transmission_frequency (decimal, required)
├── reception_satellite_id (integer, FK → satellites.id)
├── reception_antenna_id (integer, FK → station_antennas.id)
├── reception_frequency (decimal, required)
├── transmission_connectivity_id (integer, FK → station_connectivities.id, nullable)
├── reception_connectivity_id (integer, FK → station_connectivities.id, nullable)
├── transmission_channel_number (integer, nullable)
├── reception_channel_number (integer, nullable)
├── tail_numbers (integer[], array, nullable)
├── notes (text, nullable)
├── has_conflict (boolean, default: false)
├── conflict_ignored (boolean, default: false)
├── is_deleted (boolean, default: false)
├── deleted_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp, auto-update)
```
