import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateAnalyzeText, validateUploadDocument } from '../validation';
import { asyncHandler } from '../errors';
import { uploadDocument } from '../middleware/upload';
import { config } from '../config';
import { extractTextFromBuffer } from '../services/documentExtraction';
import { createReportFromText } from '../services/reportService';
import { uploadFileToBucket } from '../services/storage';
import type { AnalyzeTextRequest, Persona } from '../../../shared/src/types';

const router = Router();

// POST /api/analyze-text
router.post(
  '/analyze-text',
  validateAnalyzeText,
  asyncHandler(async (req: Request, res: Response) => {
    const { text, persona, documentName, userId } = req.body as AnalyzeTextRequest;

    const report = await createReportFromText({
      documentText: text,
      persona,
      userId: userId?.trim(),
      documentName,
    });

    res.status(201).json({ success: true, report });
  }),
);

// POST /api/upload-document
router.post(
  '/upload-document',
  uploadDocument.single('file'),
  validateUploadDocument,
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    const persona = req.body.persona as Persona;
    const userId = typeof req.body.userId === 'string' ? req.body.userId.trim() : undefined;

    if (!file) {
      res.status(400).json({ success: false, error: 'No file uploaded.' });
      return;
    }

    let documentUrl: string | undefined;
    if (!config.mockMode) {
      try {
        documentUrl = await uploadFileToBucket(
          file.buffer,
          `${uuidv4()}-${file.originalname}`,
          file.mimetype,
        );
      } catch (error) {
        console.warn('GCS upload failed, continuing without document URL:', error);
      }
    }

    const documentText = await extractTextFromBuffer(file.buffer, file.mimetype, file.originalname);
    const report = await createReportFromText({
      documentText,
      persona,
      userId,
      documentName: file.originalname,
      documentUrl,
    });

    res.status(201).json({ success: true, report });
  }),
);

export default router;
