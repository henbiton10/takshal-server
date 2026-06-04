import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { DB_SCHEMA } from './schema.constants';

dotenv.config();

const createDialect = (database: string | undefined) => {
  return new PostgresDialect({
    pool: new Pool({
      host: process.env.POSTGRES_DB_HOST,
      port: parseInt(process.env.POSTGRES_DB_PORT || '5432'),
      user: process.env.POSTGRES_DB_USER,
      password: process.env.POSTGRES_DB_PASSWORD,
      database,
      options: `-c search_path="${DB_SCHEMA}",public`,
      ssl: (process.env.ENVIRONMENT === 'local' || process.env.ENVIRONMENT === 'np') ? false : {
        rejectUnauthorized: false,
        cert: process.env.POSTGRES_DB_SSL_CERT,
        key: process.env.POSTGRES_DB_SSL_KEY,
      },
    }),
  });
};

export const createKyselyInstance = () => {
  const dialect = createDialect(process.env.POSTGRES_DB_NAME);

  return new Kysely<any>({
    dialect,
  });
};

export const createMigrationsDevVerifyInstance = () => {
  const dialect = createDialect(process.env.MIGRATIONS_DEV_VERIFY_DB_NAME);

  return new Kysely<any>({
    dialect,
  });
};

export const db = createKyselyInstance();
