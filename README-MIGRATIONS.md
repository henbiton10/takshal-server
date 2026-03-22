# Database Migrations with Kysely

This project uses Kysely for type-safe database migrations alongside TypeORM for the application layer.

## Why Kysely for Migrations?

- **Type-safe**: Get TypeScript autocompletion and type checking for your SQL queries
- **Version control**: Track database schema changes over time
- **Rollback support**: Safely revert migrations if needed
- **Clean migrations**: Write migrations in TypeScript with a fluent API

## Migration Commands

### Create a new migration

```bash
npm run migration:create <migration-name>
```

Example:
```bash
npm run migration:create create_users_table
```

This creates a timestamped migration file in the `migrations/` folder.

### Run pending migrations

```bash
npm run migration:run
```

This executes all pending migrations in order.

### Rollback the last migration

```bash
npm run migration:rollback
```

This reverts the most recent migration.

### Generate TypeScript types from database

```bash
npm run db:types
```

This generates TypeScript types in `src/database/types.ts` based on your current database schema.

## Writing Migrations

Each migration file has two functions:

### `up()` - Apply the migration

```typescript
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('email', 'varchar(255)', (col) => 
      col.notNull().unique()
    )
    .addColumn('name', 'varchar(255)', (col) => 
      col.notNull()
    )
    .addColumn('created_at', 'timestamp', (col) => 
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) => 
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Create index
  await db.schema
    .createIndex('users_email_idx')
    .on('users')
    .column('email')
    .execute();
}
```

### `down()` - Rollback the migration

```typescript
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('users').execute();
}
```

## Common Kysely Operations

### Create Table

```typescript
await db.schema
  .createTable('table_name')
  .addColumn('id', 'uuid', (col) => col.primaryKey())
  .addColumn('name', 'varchar(255)', (col) => col.notNull())
  .execute();
```

### Add Column

```typescript
await db.schema
  .alterTable('table_name')
  .addColumn('new_column', 'text')
  .execute();
```

### Create Index

```typescript
await db.schema
  .createIndex('index_name')
  .on('table_name')
  .column('column_name')
  .execute();
```

### Add Foreign Key

```typescript
await db.schema
  .alterTable('orders')
  .addForeignKeyConstraint(
    'orders_user_id_fk',
    ['user_id'],
    'users',
    ['id'],
    (cb) => cb.onDelete('cascade')
  )
  .execute();
```

### Raw SQL (when needed)

```typescript
await sql`
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
`.execute(db);
```

## Best Practices

1. **Always write both `up()` and `down()`** - Make migrations reversible
2. **One logical change per migration** - Keep migrations focused and atomic
3. **Test migrations** - Run up and down to ensure they work correctly
4. **Never modify existing migrations** - Create new migrations to make changes
5. **Use transactions** - Kysely wraps migrations in transactions by default
6. **Generate types after migrations** - Run `npm run db:types` to keep types in sync

## Migration Naming Convention

Migrations are automatically named with timestamp prefix:

```
20260322_171234_create_users_table.ts
20260322_171456_add_user_roles.ts
20260322_172301_create_products_table.ts
```

The timestamp ensures migrations run in the correct order.
