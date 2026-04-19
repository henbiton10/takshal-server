import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { DB_SCHEMA } from './schema.constants';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_DB_HOST,
      port: parseInt(process.env.POSTGRES_DB_PORT || '5432'),
      username: process.env.POSTGRES_DB_USER,
      password: process.env.POSTGRES_DB_PASSWORD,
      database: process.env.POSTGRES_DB_NAME,
      schema: DB_SCHEMA,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: process.env.ENVIRONMENT === 'local' || process.env.ENVIRONMENT === 'np',
      ssl: (process.env.ENVIRONMENT === 'local' || process.env.ENVIRONMENT === 'np') ? false : {
        rejectUnauthorized: false,
        cert: process.env.POSTGRES_DB_SSL_CERT,
        key: process.env.POSTGRES_DB_SSL_KEY,
      },
    }),
  ],
})
export class DatabaseModule {}
