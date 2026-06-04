# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Takshal Server** — NestJS + PostgreSQL backend for the Takshal communication planning system. The companion React client lives at `../takshal-client` and consumes this API. Backend and frontend evolve together — schema/DTO changes here require coordinated client edits (API types, entity-config mappers, forms, views).

## Commands

```bash
npm run start:dev        # NestJS watch mode on http://localhost:3000 (use this)
npm run start            # one-shot start, no watch
npm run build            # nest build
npm run lint             # ESLint --fix over src, apps, libs, test
npm run typecheck:remote # tsc --noEmit
npm test                 # jest (unit, *.spec.ts under src/)
npm run test:watch       # jest watch
npm run test:e2e         # jest with test/jest-e2e.json config
npm test -- path/to/file.spec.ts   # run a single test file
```

### Database

```bash
docker-compose up -d              # start Postgres 15 (port 5432, db: takshal_db_db, user/pass: postgres/postgres)
npm run migration:create <name>   # scaffold a new Kysely migration in /migrations
npm run migration:run             # apply pending migrations
npm run migration:rollback        # roll back the most recent migration
npm run db:seed                   # ts-node scripts/seed-dashboard.ts (sample data)
npm run db:clean                  # ts-node scripts/clean-db.ts
```

## Architecture

### Two ORMs: Kysely for migrations, TypeORM for runtime

This is the single most surprising thing about the codebase. **Migrations** are written in Kysely (`/migrations/*.ts`) — type-safe, reversible, with explicit `up()` / `down()`. **Application code** uses TypeORM entities (`src/<module>/entities/*.entity.ts`) and repositories. The two are kept in sync by hand.

When changing schema:
1. `npm run migration:create <name>` and write the Kysely `up`/`down`.
2. `npm run migration:run`.
3. Update the matching TypeORM entity (decorators on the new columns + any new `@ManyToOne` / `@OneToMany` relations).
4. Update the DTO (`class-validator` decorators in `src/<module>/dto/`).
5. Update the service to persist the new field across `create`, `update`, and `findOne` (relation loading).
6. Coordinate the client-side update (API types → `entityConfig.tsx` mappers → form types → form UI → view UI).

See [README-MIGRATIONS.md](./README-MIGRATIONS.md) for Kysely patterns. **Never edit a migration that has already been run** — create a new one.

### Module Layout

Standard NestJS feature modules under `src/`: `stations/`, `satellites/`, `terminals/`, `terminal-types/`, `connectivity-types/`, `networks/`, `operation-orders/`, `dashboard/`, `events/`, `auth-proxy/`, `health/`. Each follows `<name>.module.ts` + `<name>.controller.ts` + `<name>.service.ts` + `dto/` + `entities/`.

The `database/` module owns Kysely + TypeORM bootstrap (`database.module.ts`, `kysely.config.ts`, `migrator.ts`). The `events/` module owns the WebSocket gateway.

### Real-time Event Bus (decoupled)

The pattern is: service emits an in-process `EventEmitter2` event → `EventsGateway` listens → broadcasts via Socket.io to all clients. Services never touch the gateway directly. When adding a new mutation that should sync across clients, emit the appropriate event (`entity_created` / `entity_updated` / `entity_deleted` with the entity type and id) and the gateway will fan it out.

### Soft Deletes

All major entities (`stations`, `satellites`, `terminals`, `networks`, `operation_orders`, `allocations`) have `is_deleted` + `deleted_at`. All read queries must filter `WHERE is_deleted = false`. There is no automatic global filter — service methods do this explicitly.

### Updated-at Triggers

Tables with `updated_at` rely on Postgres triggers (not TypeORM `@UpdateDateColumn` behavior) to bump the timestamp. Migrations that create new tables with `updated_at` should also create the trigger — check existing migrations for the helper pattern.

### Bidirectional Relations (stations & satellites)

Stations have `station_connectivities` linking station ↔ station; satellites have `satellite_associations` linking satellite ↔ satellite. Both are stored as a single directed row but are conceptually undirected. `StationsService.findOne` loads both `connectivities` and `reverseConnectivities` and `mergeReverseConnectivities` flips reverse rows so callers see a single combined list. **When adding new fields to a connectivity (e.g. the `link*` fields), the merge function must mirror them.** The same applies on satellite associations.

### Validation

`class-validator` + `class-transformer` via a global `ValidationPipe`. DTOs live in `src/<module>/dto/`. Use `@IsOptional()` carefully — most relations are nullable in the DB.

### Operation Orders + Conflict Validation

The most complex module. `operation-orders/` owns multi-level allocations (parent + sub-allocations) with transmission/reception satellite & antenna pairs, frequencies, channels, and tail numbers. Conflict validators live in `operation-orders/validators/` — they detect overlapping satellite/frequency usage across overlapping date ranges. Conflicts are stored on the row (`has_conflict`) and can be explicitly ignored (`conflict_ignored`).

See [SCHEMA.md](./SCHEMA.md) for the full data model.

## Conventions

- **Hebrew is data, not code**: Hebrew labels are stored as values (e.g. `communication_type: 'RFOIP'`, organizational labels, frequency bands). Code is English.
- **Enums** are Postgres enums for stable sets (`organizational_affiliation`, `readiness_status`, `frequency_band`, `satellite_affiliation`). Dynamic catalogs (terminal types, connectivity types) live in their own tables and support upsert.
- **Cascade**: most FKs are `ON DELETE CASCADE`. Verify before adding new FKs that cascade is what you want.
- **No auth in this service** — `auth-proxy/` proxies to an external auth provider; routes are otherwise unguarded inside the local environment.
