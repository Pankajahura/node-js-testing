const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
};

const mapStatusCode = (err) => {
  if (err.statusCode) return err.statusCode;
  if (err.name === 'CastError') return 400;
  if (err.name === 'ValidationError') return 400;
  if (err.code === 11000) return 409;
  return 500;
};

const errorHandler = (err, req, res, next) => {
  console.error(`Error handling ${req.method} ${req.originalUrl}`, err);
  const statusCode = mapStatusCode(err);
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  });
};

module.exports = { notFoundHandler, errorHandler };
