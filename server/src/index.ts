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
    origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mockMode: config.mockMode,
    timestamp: new Date().toISOString(),
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
  console.log(`\n🛡️  LexGuard API running on http://localhost:${config.port}`);
  console.log(`📋  Mock mode: ${config.mockMode ? '✅ ON (no GCP needed)' : '❌ OFF (using real GCP)'}`);
  console.log(`🔗  Client URL: ${config.clientUrl}\n`);
});

export default app;
