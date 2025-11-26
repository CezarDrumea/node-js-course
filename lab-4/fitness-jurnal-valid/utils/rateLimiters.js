// utils/rateLimiters.js
import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
    windowMs: 60_000, // 1 minute
    max: 100,
    message: { message: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    message: { message: 'Too many login attempts. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
