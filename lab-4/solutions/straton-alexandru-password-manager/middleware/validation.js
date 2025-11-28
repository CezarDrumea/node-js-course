import { z } from 'zod';

/**
 * Validate request body against a Zod schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate request parameters against a Zod schema
 */
export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: result.error.flatten(),
      });
    }
    req.params = result.data;
    next();
  };
}

/**
 * Validate query string against a Zod schema
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: result.error.flatten(),
      });
    }
    req.query = result.data;
    next();
  };
}
