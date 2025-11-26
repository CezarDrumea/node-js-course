// utils/security.js
import helmet from 'helmet';
import cors from 'cors';

export function setupSecurity(app) {
    app.use(
        helmet({
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    "upgrade-insecure-requests": null, // ⛔ disable upgrade
                    "script-src": ["'self'"],
                    "style-src": ["'self'", "'unsafe-inline'"],
                    "img-src": ["'self'", "data:"],
                },
            },
            referrerPolicy: { policy: 'no-referrer' },
        })
    );

    if (process.env.CORS_ORIGIN || 'https://localhost:3443') {
        app.use(
            cors({
                origin: process.env.CORS_ORIGIN,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
            })
        );
    }
}
