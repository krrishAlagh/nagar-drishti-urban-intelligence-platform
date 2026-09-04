import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  WS_PORT: parseInt(process.env.WS_PORT || '5000', 10),
  APP_URL: process.env.APP_URL || 'http://localhost:3005',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DATA_DIR: path.resolve(process.cwd(), 'server/data'),
  JWT_SECRET: process.env.JWT_SECRET || 'nagar-drishti-secure-gov-jwt-key-2026',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  ENABLE_TELEMETRY_SIMULATION: process.env.ENABLE_TELEMETRY_SIMULATION !== 'false',
  SIMULATION_INTERVAL_MS: parseInt(process.env.SIMULATION_INTERVAL_MS || '6000', 10)
};
