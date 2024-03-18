import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { validate } from '../config/env.validation';

config({ path: '.env' });

const envVariables = validate(process.env);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: envVariables.DATABASE_HOST,
  port: envVariables.DATABASE_PORT,
  username: envVariables.DATABASE_USER,
  password: envVariables.DATABASE_PASSWORD,
  database: envVariables.DATABASE_NAME,
  entities: ['src/db/entities/*.entity.ts'],
  migrations: ['src/db/migrations/*.ts'],
  synchronize: false,
  migrationsRun: false,
};

export const dataSource = new DataSource(dataSourceOptions);
