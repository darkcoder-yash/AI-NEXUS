import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { initializeWebSocketServer } from './websocket.js';
import { adminRouter } from './routes/admin.js';
import { createClient } from '@supabase/supabase-js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { StructuredLogger } from './services/logger.js';

const app = express();

// Standard Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(globalRateLimiter);

// --- Request ID Middleware ---
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
  req.headers['x-request-id'] = requestId;
  next();
});

// Initialize Supabase
export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);

// Standard Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin Routes
app.use('/admin', adminRouter);

// Global Error Handler (MUST BE LAST)
app.use(globalErrorHandler);

// WebSocket Initialization
const wss = initializeWebSocketServer(config.WS_PORT);

// Start HTTP Server
const server = app.listen(config.PORT, () => {
  StructuredLogger.info(`Express server listening on port ${config.PORT}`, 'system', 'startup');
});

// Graceful Shutdown
function shutdown() {
  StructuredLogger.info('Shutting down server...', 'system', 'shutdown');
  server.close(() => {
    wss.close(() => {
      process.exit(0);
    });
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
