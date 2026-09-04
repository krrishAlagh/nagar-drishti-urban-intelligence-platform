import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] [${req.method} ${req.originalUrl}] Status: ${statusCode}, Message: ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      details: err.details || null,
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    }
  });
}
