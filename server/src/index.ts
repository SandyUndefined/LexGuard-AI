import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import analyzeRouter from './routes/analyze';
import historyRouter from './routes/history';
import enhancedAnalysisRouter from './routes/enhancedAnalysis';
import reportsRouter from './routes/reports';
import { handleError } from './errors';

const app = express();

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  return (
    config.corsOrigins.includes(origin) ||
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
  );
}

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, origin || true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ─── Middleware ────────────────────────────────────────────────────────────────
if (config.security.trustProxy) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(compression());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(
  rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    limit: config.security.rateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'LexGuard Backend',
    googleServicesReady: config.googleServicesReady,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/analyze', analyzeRouter);
app.use('/api/history', historyRouter);
app.use('/api', enhancedAnalysisRouter);
app.use('/api/reports', reportsRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(handleError);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\nLexGuard API listening on port ${config.port}`);
  console.log(`Mock mode: ${config.mockMode ? 'ON' : 'OFF'}`);
  console.log(`CORS origins: ${config.corsOrigins.join(', ')}\n`);
});

export default app;
