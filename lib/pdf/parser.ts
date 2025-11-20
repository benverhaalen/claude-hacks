import pdf from 'pdf-parse';

export interface PDFParseResult {
  success: boolean;
  text?: string;
  pages?: number;
  metadata?: any;
  error?: string;
  warning?: string;
}

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(
  fileBuffer: Buffer
): Promise<PDFParseResult> {
  try {
    // Parse PDF
    const data = await pdf(fileBuffer);

    // Check if text was extracted
    if (!data.text || data.text.trim().length === 0) {
      return {
        success: false,
        error: 'PDF appears to be scanned image or contains no text',
        warning: 'Try using OCR software to convert the PDF to searchable text first',
      };
    }

    // Check for minimal text (might be scanned)
    if (data.text.trim().length < 50) {
      return {
        success: false,
        error: 'PDF contains very little text (likely a scanned image)',
        warning: 'Please ensure the PDF contains searchable text',
      };
    }

    return {
      success: true,
      text: data.text,
      pages: data.numpages,
      metadata: data.info,
    };
  } catch (error: any) {
    console.error('PDF parsing error:', error);

    // Handle specific error types
    if (error.message?.includes('Invalid PDF')) {
      return {
        success: false,
        error: 'Invalid PDF file format',
      };
    }

    if (error.message?.includes('Encrypted')) {
      return {
        success: false,
        error: 'PDF is password-protected and cannot be read',
      };
    }

    return {
      success: false,
      error: 'Could not parse PDF',
      warning: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Extract text with page-by-page breakdown
 */
export async function extractTextByPage(
  fileBuffer: Buffer
): Promise<PDFParseResult & { pageTexts?: string[] }> {
  const result = await extractTextFromPDF(fileBuffer);

  if (!result.success || !result.text) {
    return result;
  }

  // Split by form feed character (page break indicator)
  const pageTexts = result.text.split('\f').filter((page) => page.trim());

  return {
    ...result,
    pageTexts,
  };
}

/**
 * Validate PDF file before parsing
 */
export function validatePDFFile(file: {
  name: string;
  size: number;
  type?: string;
}): { valid: boolean; error?: string } {
  // Check file extension
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return {
      valid: false,
      error: 'File must be a PDF (.pdf extension)',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'PDF file too large (max 10MB)',
    };
  }

  // Check minimum size (avoid empty files)
  if (file.size < 100) {
    return {
      valid: false,
      error: 'PDF file appears to be empty or corrupted',
    };
  }

  // Check MIME type if available
  if (file.type && file.type !== 'application/pdf') {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Expected application/pdf`,
    };
  }

  return { valid: true };
}

/**
 * Get PDF statistics
 */
export async function getPDFStats(
  fileBuffer: Buffer
): Promise<{
  pages: number;
  words: number;
  characters: number;
  hasText: boolean;
}> {
  try {
    const data = await pdf(fileBuffer);
    const text = data.text || '';
    const words = text.trim().split(/\s+/).length;

    return {
      pages: data.numpages,
      words,
      characters: text.length,
      hasText: text.trim().length > 0,
    };
  } catch (error) {
    return {
      pages: 0,
      words: 0,
      characters: 0,
      hasText: false,
    };
  }
}
