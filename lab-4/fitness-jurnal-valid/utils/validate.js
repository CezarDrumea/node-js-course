// utils/validate.js
import { ZodError } from 'zod';

/**
 * Validates body / params / query using provided Zod schemas.
 * Example:
 *    router.post('/add', validate({ body: WorkoutSchema }), controller.add)
 */
export function validate({ body, params, query }) {
    return (req, res, next) => {
        try {
            const validated = {};

            if (body) validated.body = body.parse(req.body);
            if (params) validated.params = params.parse(req.params);
            if (query) validated.query = query.parse(req.query);

            // Attach validated data for controllers
            req.valid = validated;
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: err.errors.map((e) => ({
                        path: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            next(err);
        }
    };
}
