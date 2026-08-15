export const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;

  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log full error internally
  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,

    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,

    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};