export function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Not Found' });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Malformed JSON body' });
  }

  const status = err.status || 500;

  const payload = { message: err.message || 'Internal Server Error' };
  if (err.errors) payload.errors = err.errors;
  res.status(status).json(payload);
}
