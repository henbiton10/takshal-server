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
      username: process.env.POSTGRES_DB_USERNAME,
      password: process.env.POSTGRES_DB_PASSWORD,
      database: process.env.POSTGRES_DB_NAME,
      schema: DB_SCHEMA,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}
