import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from '../config/index.js';
import * as entities from '../entity/index.js';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  synchronize: config.NODE_ENV === 'development',
  logging: config.NODE_ENV === 'development',
  entities: Object.values(entities),
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
});

export async function initDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    await normalizeSchema();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function normalizeSchema(): Promise<void> {
  if (config.NODE_ENV === 'test') {
    return;
  }

  const rows = await AppDataSource.query(
    "SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vote' AND COLUMN_NAME = 'deadline'"
  ) as { DATA_TYPE: string }[];
  const deadlineColumn = rows[0];

  if (deadlineColumn && deadlineColumn.DATA_TYPE !== 'datetime') {
    await AppDataSource.query('ALTER TABLE `vote` MODIFY `deadline` datetime NULL');
  }
}
