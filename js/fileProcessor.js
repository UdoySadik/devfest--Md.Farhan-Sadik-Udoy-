/**
 * File Processor Module (Stub - Phase 1)
 * Handles PDF validation, page counting with pdf.js, ArrayBuffer extraction,
 * and SHA-256 hash computation.
 * Full implementation in Phase 2.
 */

/**
 * Process a batch of uploaded files.
 * @param {FileList | Array<File>} files
 * @param {Array<object>} existingFiles
 * @returns {Promise<{ validFiles: Array<object>, errors: Array<string> }>}
 */
export async function processFiles(files, existingFiles = []) {
  // Stub for Phase 1 - implemented in Phase 2
  return { validFiles: [], errors: [] };
}

/**
 * Validate and process a single PDF file.
 * @param {File} file
 * @returns {Promise<object>}
 */
export async function validateAndProcessPdf(file) {
  // Stub for Phase 1 - implemented in Phase 2
  return null;
}

/**
 * Read a file as an ArrayBuffer.
 * @param {File} file
 * @returns {Promise<ArrayBuffer>}
 */
export function readFileAsArrayBuffer(file) {
  // Stub for Phase 1 - implemented in Phase 2
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Compute SHA-256 hex digest of an ArrayBuffer.
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<string>}
 */
export async function computeSha256(arrayBuffer) {
  // Web Crypto API helper
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
