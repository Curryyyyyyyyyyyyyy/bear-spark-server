import type { Context } from 'koa';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../utils/helper.js';
import type { JwtPayload } from '../types/index.js';

function resolveToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
}

export async function authenticate(ctx: Context, next: () => Promise<void>) {
  const token = resolveToken(ctx.headers.authorization);

  if (!token) {
    throw new UnauthorizedError('请先登录');
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    ctx.state.user = payload;
    await next();
  } catch {
    throw new UnauthorizedError('登录已过期，请重新登录');
  }
}

export async function optionalAuth(ctx: Context, next: () => Promise<void>) {
  const token = resolveToken(ctx.headers.authorization);

  if (token) {
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      ctx.state.user = payload;
    } catch {
      // Optional auth should not block public endpoints.
    }
  }

  await next();
}

export function requireAuth(ctx: Context): JwtPayload {
  const token = resolveToken(ctx.headers.authorization);

  if (!token) {
    throw new UnauthorizedError('请先登录');
  }

  try {
    return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('登录已过期，请重新登录');
  }
}

export function getAuthUser(ctx: Context): JwtPayload | null {
  const token = resolveToken(ctx.headers.authorization);

  if (token) {
    try {
      return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    } catch {
      return null;
    }
  }

  return null;
}
