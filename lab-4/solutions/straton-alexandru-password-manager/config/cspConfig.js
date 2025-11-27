/**
 * Content Security Policy Configuration
 * Defines CSP directives for security while allowing necessary external resources
 */

export const cspConfig = {
  contentSecurityPolicy: {
    directives: {
      // Default source for all content types
      defaultSrc: ["'self'"],

      // Scripts: Allow self, inline scripts, and Bootstrap CDN
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
      ],

      // Stylesheets: Allow self, inline styles, and Bootstrap CDN
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
      ],

      // Fonts: Allow self and Bootstrap Icons CDN
      fontSrc: [
        "'self'",
        'https://cdn.jsdelivr.net',
      ],

      // Images: Allow self, data URIs, and HTTPS
      imgSrc: [
        "'self'",
        'data:',
        'https:',
      ],

      // Connect sources for API calls
      connectSrc: [
        "'self'",
      ],

      // Frame ancestors to prevent clickjacking
      frameAncestors: ["'none'"],

      // Base URI restriction
      baseUri: ["'self'"],

      // Form action restriction
      formAction: ["'self'"],
    },
  },

  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },

  // Frame guard to prevent clickjacking
  frameguard: {
    action: 'deny',
  },

  // Prevent MIME type sniffing
  noSniff: true,

  // XSS filter
  xssFilter: true,

  // Referrer policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
};
