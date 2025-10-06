import { ZodError } from 'zod';

export function validate({ body, params, query }) {
  return (req, res, next) => {
    try {
      const validated = {};
      if (body) validated.body = body.parse(req.body);
      if (params) validated.params = params.parse(req.params);
      if (query) validated.query = query.parse(req.query);
      req.valid = validated;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed (zod)',
          errors: err.errors,
        });
      }
      next(err);
    }
  };
}
