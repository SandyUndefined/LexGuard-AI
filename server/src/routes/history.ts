import { Router, Request, Response } from 'express';
import { config } from '../config';
import { getAnalysis, listAnalyses } from '../services/firestore';
import { MOCK_HISTORY, getMockAnalysis } from '../mock/mockData';

const router = Router();

// GET /api/history
router.get('/', async (_req: Request, res: Response) => {
  try {
    if (config.mockMode) {
      res.json({ success: true, items: MOCK_HISTORY });
      return;
    }
    const items = await listAnalyses(50);
    res.json({ success: true, items });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// GET /api/history/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (config.mockMode) {
      const result = getMockAnalysis(id);
      if (!result) {
        res.status(404).json({ success: false, error: 'Analysis not found' });
        return;
      }
      res.json({ success: true, result });
      return;
    }
    const result = await getAnalysis(id);
    if (!result) {
      res.status(404).json({ success: false, error: 'Analysis not found' });
      return;
    }
    res.json({ success: true, result });
  } catch (error) {
    console.error('History detail error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analysis' });
  }
});

export default router;
