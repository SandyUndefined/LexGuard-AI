import { ApiError } from '../errors';

interface DocumentExtractionInput {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

interface DocumentTextExtractor {
  canExtract(mimeType: string): boolean;
  extract(input: DocumentExtractionInput): Promise<string>;
}

class PlainTextExtractor implements DocumentTextExtractor {
  canExtract(mimeType: string): boolean {
    return mimeType === 'text/plain';
  }

  async extract({ buffer }: DocumentExtractionInput): Promise<string> {
    return buffer.toString('utf-8');
  }
}

class PlaceholderExtractor implements DocumentTextExtractor {
  private readonly supportedMimeTypes: Set<string>;
  private readonly label: string;

  constructor(label: string, mimeTypes: string[]) {
    this.label = label;
    this.supportedMimeTypes = new Set(mimeTypes);
  }

  canExtract(mimeType: string): boolean {
    return this.supportedMimeTypes.has(mimeType);
  }

  async extract({ fileName, mimeType }: DocumentExtractionInput): Promise<string> {
    return `[${this.label} uploaded: ${fileName}. Text extraction placeholder for ${mimeType}. Add a Document AI or Vision API extractor in server/src/services/documentExtraction.ts to analyze this file's full contents.]`;
  }
}

const EXTRACTORS: DocumentTextExtractor[] = [
  new PlainTextExtractor(),
  new PlaceholderExtractor('PDF document', ['application/pdf']),
  new PlaceholderExtractor('Image document', ['image/png', 'image/jpeg']),
];

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const extractor = EXTRACTORS.find((candidate) => candidate.canExtract(mimeType));
  if (extractor) {
    return extractor.extract({ buffer, mimeType, fileName });
  }

  throw new ApiError(
    422,
    `Text extraction is not available for ${mimeType}. Upload a PDF, PNG, JPG, or TXT document.`,
  );
}
