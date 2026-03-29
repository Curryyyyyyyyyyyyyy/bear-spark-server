import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from '../config/index.js';
import type { IUser, IArticle, INews, IVideo, IComment, ICategory } from '../types/index.js';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  synchronize: config.NODE_ENV === 'development',
  logging: config.NODE_ENV === 'development',
  entities: [],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
});

export async function initDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}
