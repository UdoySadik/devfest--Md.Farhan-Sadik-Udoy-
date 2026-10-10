/**
 * File Processor Module (Phase 6 B7 Implementation)
 * Multi-file PDF upload with defensive error handling:
 * - B7: Specific, targeted detection of PasswordException and InvalidPDFException
 * - PDF MIME / extension validation
 * - Dual PDF engine support (pdf.js and pdf-lib fallback) for page counting and structural validation
 * - ArrayBuffer reading & SHA-256 content hashing
 * - File limits (max 30 files, max 50 MB total)
 * - Defensive try/catch so damaged files never crash the app
 */

import { removeUploadedFile } from './state.js';
import { t } from './i18n.js';

export const MAX_FILES = 30;
export const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB in bytes

/**
 * Read a file as an ArrayBuffer.
 * @param {File|Blob} file
 * @returns {Promise<ArrayBuffer>}
 */
export async function readFileAsArrayBuffer(file) {
  if (file && typeof file.arrayBuffer === 'function') {
    return await file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read file ${file.name}: ${reader.error?.message}`));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Compute SHA-256 hex digest of an ArrayBuffer.
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<string>}
 */
export async function computeSha256(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate and process a single PDF file with defensive B7 error handling.
 * @param {File} file
 * @returns {Promise<{ fileId: string, name: string, size: number, pageCount: number, contentHash: string, arrayBuffer: ArrayBuffer }>}
 */
export async function validateAndProcessPdf(file) {
  // 1. Extension & MIME check
  const isPdfExtension = file.name && file.name.toLowerCase().endsWith('.pdf');
  const isPdfMime = file.type === 'application/pdf';

  if (!isPdfExtension && !isPdfMime) {
    throw new Error(`"${file.name}" is not a PDF. ${t('notPdf')}`);
  }

  // 2. Check for empty files (0 bytes)
  if (file.size === 0) {
    throw new Error(`"${file.name}" is empty (0 bytes).`);
  }

  // 3. Read ArrayBuffer
  const arrayBuffer = await readFileAsArrayBuffer(file);

  // Check for minimal PDF header %PDF-
  if (arrayBuffer.byteLength < 5) {
    throw new Error(`"${file.name}" is damaged or empty.`);
  }

  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
  const headerStr = String.fromCharCode(...headerBytes);
  if (headerStr !== '%PDF-') {
    throw new Error(`"${file.name}" ${t('corruptedPdf')}`);
  }

  // 4. Validate PDF structure and count pages (B7: Safe bad file handling)
  let pageCount = 0;
  let parsedSuccessfully = false;

  // Try pdf.js first
  let detectedExpiryDate = null;
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    try {
      const loadingTask = window.pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer.slice(0)),
        disableWorker: true
      });
      const pdf = await Promise.race([
        loadingTask.promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 1500))
      ]);
      pageCount = pdf.numPages;
      parsedSuccessfully = true;

      // Extract text content from pages to detect expiry date if present
      try {
        const pagesToCheck = Math.min(pageCount, 2);
        for (let pNum = 1; pNum <= pagesToCheck; pNum++) {
          const page = await pdf.getPage(pNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');

          const expiryMatch = pageText.match(/(?:valid\s+until|expiry\s+date|valid\s+upto|valid\s+to|valid\s+through)[\s\S]*?(\d{4}-\d{2}-\d{2})/i) ||
                             pageText.match(/\((\d{4}-\d{2}-\d{2})\)/);
          if (expiryMatch && expiryMatch[1]) {
            detectedExpiryDate = expiryMatch[1];
            break;
          }
        }
      } catch (textErr) {
        // Graceful non-blocking fallback
      }
    } catch (pdfErr) {
      const errName = pdfErr?.name || '';
      const errMsg = String(pdfErr?.message || '').toLowerCase();

      if (errName === 'PasswordException' || errMsg.includes('password')) {
        throw new Error(`"${file.name}" ${t('passwordProtectedPdf')}`);
      } else if (errName === 'InvalidPDFException' || errMsg.includes('invalid') || errMsg.includes('corrupt')) {
        throw new Error(`"${file.name}" ${t('corruptedPdf')}`);
      }
      // If timed out or general worker issue, will attempt pdf-lib fallback below
    }
  }

  // Fallback to pdf-lib if pdf.js was unavailable or timed out
  if (!parsedSuccessfully && typeof window !== 'undefined' && window.PDFLib) {
    try {
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      pageCount = pdfDoc.getPageCount();
      parsedSuccessfully = true;
    } catch (libErr) {
      const msg = String(libErr?.message || '').toLowerCase();
      if (msg.includes('password') || msg.includes('encrypt')) {
        throw new Error(`"${file.name}" ${t('passwordProtectedPdf')}`);
      }
      throw new Error(`"${file.name}" ${t('corruptedPdf')}`);
    }
  }

  if (!parsedSuccessfully) {
    pageCount = 1; // Default fallback
  }

  // 5. Compute SHA-256 content hash
  const contentHash = await computeSha256(arrayBuffer);

  // 6. Generate unique file ID
  const fileId = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);

  return {
    fileId,
    name: file.name,
    size: file.size,
    pageCount,
    contentHash,
    arrayBuffer,
    detectedExpiryDate: detectedExpiryDate || null,
    isDuplicate: false,
    duplicateGroupId: null
  };
}

/**
 * Process a batch of uploaded files while enforcing 30 files / 50 MB limits.
 * Gracefully isolates errors per file so bad files never halt batch processing.
 * @param {FileList | Array<File>} files
 * @param {Array<object>} existingFiles
 * @returns {Promise<{ validFiles: Array<object>, errors: Array<string> }>}
 */
export async function processFiles(files, existingFiles = []) {
  const fileList = Array.from(files || []);
  const validFiles = [];
  const errors = [];

  let currentCount = existingFiles.length;
  let currentTotalSize = existingFiles.reduce((acc, f) => acc + (f.size || 0), 0);

  for (const file of fileList) {
    // Enforce 30 file limit
    if (currentCount >= MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files allowed. "${file.name}" and remaining files were skipped.`);
      break;
    }

    // Enforce 50 MB total size limit
    if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
      errors.push(`Total size exceeds 50 MB limit. "${file.name}" could not be added.`);
      continue;
    }

    try {
      const processed = await validateAndProcessPdf(file);
      validFiles.push(processed);
      currentCount++;
      currentTotalSize += file.size;
    } catch (err) {
      errors.push(err.message || `Failed to process "${file.name}"`);
    }
  }

  return { validFiles, errors };
}

/**
 * Remove an uploaded file by ID.
 * @param {string} fileId
 */
export function removeFile(fileId) {
  removeUploadedFile(fileId);
}
