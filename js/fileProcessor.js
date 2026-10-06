/**
 * File Processor Module (Phase 2 Implementation)
 * Multi-file PDF upload with strict validation:
 * - PDF MIME / extension validation
 * - pdf.js document validation & page counting
 * - ArrayBuffer reading & SHA-256 content hashing
 * - File limits (max 30 files, max 50 MB total)
 * - File removal
 */

import { removeUploadedFile } from './state.js';

export const MAX_FILES = 30;
export const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB in bytes

/**
 * Read a file as an ArrayBuffer using FileReader API.
 * @param {File|Blob} file
 * @returns {Promise<ArrayBuffer>}
 */
export function readFileAsArrayBuffer(file) {
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
 * Validate and process a single PDF file using pdf.js.
 * @param {File} file
 * @returns {Promise<{ fileId: string, name: string, size: number, pageCount: number, contentHash: string, arrayBuffer: ArrayBuffer }>}
 */
export async function validateAndProcessPdf(file) {
  // 1. Extension & MIME check
  const isPdfExtension = file.name && file.name.toLowerCase().endsWith('.pdf');
  const isPdfMime = file.type === 'application/pdf';

  if (!isPdfExtension && !isPdfMime) {
    throw new Error(`"${file.name}" is not a PDF. Only PDF files are accepted.`);
  }

  // 2. Read ArrayBuffer
  const arrayBuffer = await readFileAsArrayBuffer(file);

  // Check for minimal PDF header %PDF-
  if (arrayBuffer.byteLength < 5) {
    throw new Error(`"${file.name}" is empty or not a valid PDF.`);
  }

  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
  const headerStr = String.fromCharCode(...headerBytes);
  if (headerStr !== '%PDF-') {
    throw new Error(`"${file.name}" is not a valid PDF file.`);
  }

  // 3. Validate with pdf.js and count pages
  let pageCount = 0;
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    try {
      const loadingTask = window.pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer.slice(0))
      });
      const pdf = await loadingTask.promise;
      pageCount = pdf.numPages;
    } catch (pdfErr) {
      throw new Error(`"${file.name}" is corrupted, password-protected, or invalid.`);
    }
  } else {
    // Fallback if pdf.js is not loaded
    pageCount = 1;
  }

  // 4. Compute SHA-256 content hash
  const contentHash = await computeSha256(arrayBuffer);

  // 5. Generate file ID
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
    isDuplicate: false,
    duplicateGroupId: null
  };
}

/**
 * Process a batch of uploaded files while enforcing 30 files / 50 MB limits.
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
