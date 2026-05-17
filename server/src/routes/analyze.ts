import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { analyzeDocumentWithGemini } from '../services/gemini';
import { uploadFileToBucket } from '../services/storage';
import { saveAnalysis } from '../services/firestore';
import { generateMockAnalysis } from '../mock/mockData';
import { Persona } from '../../../shared/src/types';

const router = Router();

// Multer: store files in memory (max 20MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8');
  }
  if (mimeType === 'application/pdf') {
    // Dynamic import to avoid issues if pdf-parse isn't installed
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text;
    } catch {
      return `[PDF content from ${fileName} - text extraction failed, Gemini will analyze the image directly]`;
    }
  }
  // For images, return a note — Gemini multimodal can handle images directly
  return `[Image document: ${fileName}]`;
}

// POST /api/analyze
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const persona = (req.body.persona as Persona) || 'employee';
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, error: 'No file uploaded.' });
      return;
    }

    const validPersonas: Persona[] = ['employee', 'freelancer', 'customer', 'tenant', 'vendor'];
    if (!validPersonas.includes(persona)) {
      res.status(400).json({ success: false, error: `Invalid persona: ${persona}` });
      return;
    }

    // ── MOCK MODE ──────────────────────────────────────────────────────────────
    if (config.mockMode) {
      // Simulate analysis delay
      await new Promise((r) => setTimeout(r, 2000));
      const mockResult = generateMockAnalysis(file.originalname, persona);
      res.json({ success: true, result: mockResult });
      return;
    }

    // ── REAL MODE ──────────────────────────────────────────────────────────────

    // 1. Upload to GCS
    const destFileName = `${uuidv4()}-${file.originalname}`;
    let documentUrl: string | undefined;
    try {
      documentUrl = await uploadFileToBucket(
        file.buffer,
        destFileName,
        file.mimetype,
      );
    } catch (err) {
      console.warn('GCS upload failed, proceeding without URL:', err);
    }

    // 2. Extract text
    const documentText = await extractTextFromBuffer(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    // 3. Analyze with Gemini
    const result = await analyzeDocumentWithGemini(
      documentText,
      file.originalname,
      persona,
      documentUrl,
    );

    // 4. Save to Firestore
    try {
      await saveAnalysis(result);
    } catch (err) {
      console.warn('Firestore save failed, returning result anyway:', err);
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
