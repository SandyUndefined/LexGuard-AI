import type { Request, Response, NextFunction } from 'express';
import type { Persona } from '../../../shared/src/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_PERSONAS: Persona[] = ['employee', 'freelancer', 'customer', 'tenant', 'vendor'];

export function isValidPersona(value: unknown): value is Persona {
  return typeof value === 'string' && VALID_PERSONAS.includes(value as Persona);
}

// ─── Validate POST /api/analyze-text ─────────────────────────────────────────

export function validateAnalyzeText(req: Request, res: Response, next: NextFunction): void {
  const { text, persona, documentName } = req.body as Record<string, unknown>;

  if (typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Body field "text" is required and must be a non-empty string.',
    });
    return;
  }

  if (text.length > 500_000) {
    res.status(400).json({
      success: false,
      error: 'Document text exceeds 500,000 character limit.',
    });
    return;
  }

  if (!isValidPersona(persona)) {
    res.status(400).json({
      success: false,
      error: `Body field "persona" must be one of: ${VALID_PERSONAS.join(', ')}.`,
    });
    return;
  }

  if (documentName !== undefined && typeof documentName !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Optional field "documentName" must be a string.',
    });
    return;
  }

  next();
}

// ─── Validate POST /api/upload-document ──────────────────────────────────────

export function validateUploadDocument(req: Request, res: Response, next: NextFunction): void {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: 'A file must be uploaded in the "file" field (multipart/form-data).',
    });
    return;
  }

  const { persona } = req.body as Record<string, unknown>;
  if (!isValidPersona(persona)) {
    res.status(400).json({
      success: false,
      error: `Form field "persona" must be one of: ${VALID_PERSONAS.join(', ')}.`,
    });
    return;
  }

  next();
}

// ─── Validate :id param ───────────────────────────────────────────────────────

export function validateReportId(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    res.status(400).json({ success: false, error: 'Report ID is required.' });
    return;
  }
  next();
}
