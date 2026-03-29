import { describe, it, expect, beforeAll, vi } from 'vitest';

vi.mock('dotenv', () => ({
  default: {
    config: vi.fn(),
  },
}));

describe('Config', () => {
  beforeAll(() => {
    process.env = {
      PORT: '3000',
      NODE_ENV: 'development',
      DB_HOST: 'localhost',
      DB_PORT: '3306',
      DB_USERNAME: 'root',
      DB_PASSWORD: 'password',
      DB_DATABASE: 'test_db',
      JWT_SECRET: 'a'.repeat(32),
      JWT_EXPIRES_IN: '7d',
      CORS_ORIGIN: 'http://localhost:5173',
    };
  });

  it('should validate and parse environment variables', async () => {
    const { config } = await import('./index.js');
    expect(config.PORT).toBe(3000);
    expect(config.NODE_ENV).toBe('development');
    expect(config.DB_DATABASE).toBe('test_db');
  });
});
