import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { DB_SCHEMA } from './schema.constants';

dotenv.config();

export const createKyselyInstance = () => {
  const dialect = new PostgresDialect({
    pool: new Pool({
      host: process.env.POSTGRES_DB_HOST,
      port: parseInt(process.env.POSTGRES_DB_PORT || '5432'),
      user: process.env.POSTGRES_DB_USERNAME,
      password: process.env.POSTGRES_DB_PASSWORD,
      database: process.env.POSTGRES_DB_NAME,
      options: `-c search_path="${DB_SCHEMA}",public`,
    }),
  });

  return new Kysely<any>({
    dialect,
  });
};

export const db = createKyselyInstance();
