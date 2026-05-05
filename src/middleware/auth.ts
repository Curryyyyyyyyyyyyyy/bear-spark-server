import type { Context } from 'koa';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../utils/helper.js';
import type { JwtPayload } from '../types/index.js';

/**
 * JWT 认证中间件（用于 Koa 路由）
 */
export async function authenticate(ctx: Context, next: () => Promise<void>) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('未登录，请先登录');
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    ctx.state.user = payload;
    await next();
  } catch {
    throw new UnauthorizedError('Token 已过期，请重新登录');
  }
}

/**
 * 可选认证中间件（用于 Koa 路由）
 */
export async function optionalAuth(ctx: Context, next: () => Promise<void>) {
  const authHeader = ctx.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      ctx.state.user = payload;
    } catch {
      // ignore
    }
  }

  await next();
}

/**
 * 验证当前请求的用户（用于 Controller 中直接调用）
 * 如果未登录或 token 无效，抛出 UnauthorizedError
 */
export function requireAuth(ctx: Context): JwtPayload {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('未登录，请先登录');
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    return payload;
  } catch {
    throw new UnauthorizedError('Token 已过期，请重新登录');
  }
}

/**
 * 获取当前请求的用户（可选，不抛异常）
 */
export function getAuthUser(ctx: Context): JwtPayload | null {
  const authHeader = ctx.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    } catch {
      return null;
    }
  }

  return null;
}
