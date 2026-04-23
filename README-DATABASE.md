# Database Setup

This project uses PostgreSQL v15 with TypeORM.

## Local Development Setup

### Prerequisites

Make sure you have PostgreSQL 15 installed locally.

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql-15
sudo systemctl start postgresql
```

### Database Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the database credentials in `.env` if needed:
```env
POSTGRES_DB_HOST=localhost
POSTGRES_DB_PORT=5432
POSTGRES_DB_USER=postgres
POSTGRES_DB_PASSWORD=postgres
POSTGRES_DB_NAME=takshal_db
POSTGRES_DB_SCHEMA=takshal_plan
```

4. Create the database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE takshal_db;

# Exit psql
\q
```

### Running the Application

The database connection will be automatically established when you start the server:

```bash
npm run start:dev
```

## Seeding Data

To populate the database with a large set of sample data for testing (especially for the dashboard), you can use the seeding script:

```bash
# Make sure your .env is configured first
npx ts-node scripts/seed-dashboard.ts
```

This script will:
- Clean all existing data
- Create 10+ stations with different affiliations (airforce, tikshuv)
- Create 12 satellites (AMOS, Intelsat, etc.)
- Create 10+ terminals and antennas
- Generate 10 overlapping operation orders
- Populate dense allocations for the dashboard view
- Create 10 communication networks

## Database Module

The `DatabaseModule` is configured in `src/database/database.module.ts` and uses TypeORM for ORM functionality.

### Features

- **Auto-synchronization**: In development mode, TypeORM will automatically sync your entities with the database schema
- **Logging**: SQL queries are logged in development mode
- **Entity discovery**: All `*.entity.ts` files are automatically loaded

### Creating Entities

Create entity files in your feature modules with the `.entity.ts` suffix:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}
```

### Using Entities in Modules

Import the entity in your feature module:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService],
})
export class UserModule {}
```
