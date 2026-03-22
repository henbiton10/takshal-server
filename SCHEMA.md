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
- All foreign key columns
- Frequently queried fields (station_id, terminal_type_id, etc.)
