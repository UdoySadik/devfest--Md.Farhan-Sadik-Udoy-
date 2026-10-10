/**
 * Exporter Module (Phase 6 B3 Implementation)
 * Exports the tender requirements checklist as a UTF-8 CSV file.
 * Features:
 * - Full requirement details (Order, ID, English & Bengali titles, Type, Expiry tracking)
 * - Matched file details (Filename, Page count)
 * - Real-time status & Expiry date
 * - Tender header metadata
 * - UTF-8 BOM encoding for seamless Microsoft Excel compatibility with Unicode/Bangla
 * - Strict CSV escaping (handles quotes, commas, newlines)
 */

import { getDocTitle } from './i18n.js';

/**
 * Escape a single CSV cell value according to RFC 4180.
 * @param {any} val
 * @returns {string}
 */
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Build CSV text from the application state.
 * @param {object} state Current application state snapshot
 * @returns {string} Formatted CSV string
 */
export function generateChecklistCsv(state) {
  if (!state || !state.requirements || state.requirements.length === 0) {
    throw new Error('No requirements available to export. Please load requirements.json first.');
  }

  const rows = [];
  const tender = state.tender || {};

  // 1. Tender Metadata Headers
  rows.push(['TENDER CHECKLIST REPORT']);
  rows.push(['Tender ID', tender.tender_id || 'N/A']);
  rows.push(['Tender Title', tender.title || 'N/A']);
  rows.push(['Procuring Entity', tender.procuring_entity || 'N/A']);
  rows.push(['Bidder', tender.bidder || 'N/A']);
  rows.push(['Submission Deadline', tender.submission_deadline || 'N/A']);
  rows.push(['Export Timestamp', new Date().toISOString()]);
  rows.push([]); // Blank row separator

  // 2. Table Column Headers
  rows.push([
    'Order',
    'Requirement ID',
    'Document Name (EN)',
    'Document Name (BN)',
    'Requirement Type',
    'Has Expiry',
    'Matched File',
    'Page Count',
    'Expiry Date',
    'Current Status'
  ]);

  // 3. Document Rows sorted strictly by order
  const sortedReqs = [...state.requirements].sort((a, b) => a.order - b.order);

  for (const req of sortedReqs) {
    const matchedFileId = state.matches ? state.matches[req.id] : null;
    const file = matchedFileId && state.uploadedFiles
      ? state.uploadedFiles.find(f => f.fileId === matchedFileId)
      : null;

    const matchedFileName = file ? file.name : (req.mandatory ? 'NOT MATCHED' : 'Not provided');
    const pageCount = file ? (file.pageCount || 1) : 0;
    const expiryDate = state.expiryDates && state.expiryDates[req.id]
      ? state.expiryDates[req.id]
      : (req.has_expiry ? 'Pending / Not entered' : 'N/A');
    const status = state.statuses ? (state.statuses[req.id] || 'Missing') : 'Missing';

    rows.push([
      req.order,
      req.id,
      req.title_en || '',
      req.title_bn || '',
      req.mandatory ? 'Mandatory' : 'Optional',
      req.has_expiry ? 'Yes' : 'No',
      matchedFileName,
      pageCount,
      expiryDate,
      status
    ]);
  }

  return rows.map(row => row.map(escapeCsvCell).join(',')).join('\r\n');
}

/**
 * Trigger browser download of the checklist CSV file.
 * Filename format: <tender_id>_Checklist.csv
 * @param {object} state
 */
export function exportChecklistCsv(state) {
  const csvContent = generateChecklistCsv(state);
  const tenderId = (state.tender?.tender_id || 'Tender').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${tenderId}_Checklist.csv`;

  // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows properly displays Unicode & Bengali script
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
