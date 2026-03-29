import { describe, it, expect } from 'vitest';
import { success, AppError, BadRequestError } from './helper.js';

describe('Helper Utils', () => {
  describe('success', () => {
    it('should return correct success response format', () => {
      const result = success({ id: 1, name: 'test' });
      expect(result).toEqual({
        code: 0,
        message: 'Success',
        data: { id: 1, name: 'test' },
      });
    });

    it('should accept custom message', () => {
      const result = success(null, 'Operation completed');
      expect(result.message).toBe('Operation completed');
    });
  });

  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError(400, 'BAD_REQUEST', 'Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('AppError');
    });
  });

  describe('BadRequestError', () => {
    it('should create 400 error', () => {
      const error = new BadRequestError('Invalid data');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });

    it('should have default message', () => {
      const error = new BadRequestError();
      expect(error.message).toBe('Bad Request');
    });
  });
});
