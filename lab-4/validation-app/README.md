# Validation App (Lab 4)

A tiny Express application demonstrating backend validation with Zod and express-validator, plus security middleware (helmet) and rate limiting.

## Install

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`.

## Endpoints

- `GET /health` → health check
- `GET /users` → query validation with Zod
  - Query: `role?=student|teacher|admin`, `minAge?`, `maxAge?` (coerced to numbers, with cross-field check `minAge <= maxAge`)
- `POST /users` → body validation with Zod
  - Body: `{ name: string(2..50), email: email, age?: int>=13, role: enum }`
- `GET /users/:id` → params validation with Zod
- `PATCH /users/:id` → partial body validation with Zod
- `DELETE /users/:id` → params validation with Zod
- `POST /users/validator-example` → express-validator example

## How validation works

- Zod middleware parses `req.body`, `req.params`, `req.query` and attaches validated data to `req.valid`.
- On failure, returns `400` with structured Zod errors.
- The express-validator example showcases declarative validators and `validationResult()`.

## Security & Limits

- `helmet()` sets secure HTTP headers.
- `express-rate-limit` limits requests per IP to mitigate abuse.

## Teaching tips

- Show how malformed input never reaches route logic.
- Demonstrate number coercion and enums.
- Compare Zod vs express-validator ergonomics and DX.
- Discuss central error handling and why 400 vs 500 matters.
