# Takshal Server - Communication Planning API

The backend engine for the Takshal Management System, built with NestJS and PostgreSQL.

## Features

- **Resource API**: CRUD operations for Stations, Satellites, Terminals, and Networks.
- **Operation Planning Engine**: Complex management of operation orders and multi-level allocations.
- **Conflict Validation**: Intelligent checking for satellite and frequency conflicts.
- **Soft Delete**: Data safety with logical deletion throughout the system.
- **Audit Logs**: Automatic timestamp management via database triggers.

## Architecture

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Validation**: Class-validator with DTOs
- **Migrations**: Automated database schema management

## Database Schema

For a detailed view of the database structure, please refer to [SCHEMA.md](./SCHEMA.md).

## Getting Started

### Installation

```bash
$ npm install
```

### Database Setup

1. Start the PostgreSQL database using Docker:
```bash
$ docker-compose up -d
```
2. The schema will be automatically synchronized or migrated on startup.

### Running the App

```bash
# development
$ npm run start

# watch mode (recommended for development)
$ npm run start:dev
```

## API Documentation

The API routes are organized by feature:

- `/stations`: Ground station management
- `/satellites`: Satellite resources
- `/terminals`: Terminal equipment linked to stations
- `/networks`: Communication networks
- `/operation-orders`: Planning and allocation engine

## License

Private Project - All Rights Reserved
