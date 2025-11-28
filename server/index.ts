import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import supportRoutes from '../src/features/support/api/support.routes';
import cors from 'cors';
import http from 'http';

// Verify required environment variables
const requiredEnvVars = ['PERPLEXITY_API_KEY', 'SUPPORT_EMAIL', 'RESEND_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);

if (missingEnvVars.length > 0) {
  if (process.env.NODE_ENV === 'production') {
    console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  } else {
    console.warn(`Warning: Missing environment variables (AI/email features will be limited): ${missingEnvVars.join(', ')}`);
  }
}

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Middleware
app.use(cors());
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalJson = res.json;
  res.json = function (body) {
    capturedJsonResponse = body;
    return originalJson.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    log(`${req.method} ${path} ${res.statusCode} - ${duration}ms`);
    if (capturedJsonResponse) {
      log('Response:', JSON.stringify(capturedJsonResponse, null, 2));
    }
  });

  next();
});

// API Routes
app.use('/api/support', supportRoutes);

// Register other routes
registerRoutes(app);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// In development, Express runs on port 3000 (API only, Vite handles frontend on 5000)
// In production, Express runs on PORT env var (serves static files + API)
const PORT = process.env.NODE_ENV === 'development' 
  ? 3000 
  : parseInt(process.env.PORT || '5000', 10);

// In development, run as API server only (Vite handles the frontend)
// In production, serve static files and act as full server
if (process.env.NODE_ENV !== 'development') {
  serveStatic(app);
}

const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  log(`Server running on http://localhost:${PORT}`);
});

export { app, server };