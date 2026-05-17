import { Router, Request, Response } from 'express';
import { ApiError, asyncHandler } from '../errors';
import { getReportById, listReportSummaries } from '../services/reportService';
import { buildPrintableReportHtml, buildReportExportFilename } from '../services/reportExport';
import { validateReportId } from '../validation';

const router = Router();

// GET /api/reports
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = typeof req.query.userId === 'string' ? req.query.userId.trim() : undefined;
    const reports = await listReportSummaries(userId || undefined);
    res.json({ success: true, reports });
  }),
);

// GET /api/reports/:id/export
router.get(
  '/:id/export',
  validateReportId,
  asyncHandler(async (req: Request, res: Response) => {
    const report = await getReportById(req.params.id);

    if (!report) {
      throw new ApiError(404, 'Report not found');
    }

    res
      .status(200)
      .type('html')
      .setHeader('Content-Disposition', `inline; filename="${buildReportExportFilename(report)}"`);
    res.send(buildPrintableReportHtml(report));
  }),
);

// GET /api/reports/:id
router.get(
  '/:id',
  validateReportId,
  asyncHandler(async (req: Request, res: Response) => {
    const report = await getReportById(req.params.id);

    if (!report) {
      throw new ApiError(404, 'Report not found');
    }

    res.json({ success: true, report });
  }),
);

export default router;
