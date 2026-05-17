import express from 'express';
import cors from 'cors';
import { config } from './config';
import analyzeRouter from './routes/analyze';
import historyRouter from './routes/history';
import enhancedAnalysisRouter from './routes/enhancedAnalysis';
import reportsRouter from './routes/reports';
import { handleError } from './errors';

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'LexGuard Backend',
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
