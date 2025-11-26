// utils/handlers.js
import { ZodError } from 'zod';

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res, next) {
    if (req.accepts('html')) {
        return res.status(404).render('404', { url: req.originalUrl });
    }
    res.status(404).json({ message: 'Not Found', path: req.originalUrl });
}

/**
 * Central error handler (handles Zod, JSON, custom, generic)
 */
export function errorHandler(err, req, res, next) {
    // Zod validation error
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: err.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    // Malformed JSON
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ message: 'Malformed JSON body' });
    }

    // Known status errors (custom or library)
    const status = err.status || 500;
    const payload = {
        message: err.message || 'Internal Server Error',
    };
    if (err.errors) payload.errors = err.errors;

    // Log only server errors
    if (status >= 500) console.error('❌ Internal error:', err);

    res.status(status).json(payload);
}
