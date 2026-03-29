import type { Context, Next } from 'koa';
import { config } from '../config/index.js';

export async function cors(ctx: Context, next: Next) {
  ctx.set('Access-Control-Allow-Origin', config.CORS_ORIGIN);
  ctx.set('Access-Control-Allow-Credentials', 'true');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  ctx.set('Access-Control-Max-Age', '86400');

  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    return;
  }

  await next();
}

export async function requestLogger(ctx: Context, next: Next) {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`[${ctx.method}] ${ctx.url} - ${ctx.status} - ${duration}ms`);
}
