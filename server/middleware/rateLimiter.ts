import { Request, Response, NextFunction } from 'express';

interface RequestBucket {
  count: number;
  resetTime: number;
}

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 300; // 300 req/min per IP
const ipMap = new Map<string, RequestBucket>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  let bucket = ipMap.get(ip);

  if (!bucket || now > bucket.resetTime) {
    bucket = { count: 1, resetTime: now + WINDOW_MS };
    ipMap.set(ip, bucket);
  } else {
    bucket.count++;
  }

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - bucket.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetTime / 1000));

  if (bucket.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests. Please slow down.',
        retryAfterSeconds: Math.ceil((bucket.resetTime - now) / 1000)
      }
    });
  }

  next();
}
