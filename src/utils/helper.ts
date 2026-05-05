import type { Context, Next } from 'koa';
import { logger } from './logger.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(400, 'BAD_REQUEST', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, 'CONFLICT', message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(500, 'INTERNAL_SERVER_ERROR', message);
  }
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export function success<T>(data: T, message = 'Success'): ApiResponse<T> {
  return {
    code: 0,
    message,
    data,
  };
}

export function errorResponse(
  statusCode: number,
  _code: string,
  message: string
): ApiResponse<null> {
  return {
    code: statusCode,
    message,
    data: null,
  };
}

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      ctx.status = err.statusCode;
      ctx.body = errorResponse(err.statusCode, err.code, err.message);
      logger.warn(`[${err.code}] ${err.message}`, {
        path: ctx.path,
        method: ctx.method,
      });
    } else if (err instanceof Error) {
      ctx.status = 500;
      ctx.body = errorResponse(500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error');
      logger.error(`[UNHANDLED ERROR] ${err.message}`, { stack: err.stack });
    } else {
      ctx.status = 500;
      ctx.body = errorResponse(500, 'UNKNOWN_ERROR', 'Unknown Error');
    }
  }
}
