/**
 * Status Engine Module (Phase 3 Full Implementation)
 * Pure business logic for evaluating requirement statuses according to strict priority rules:
 * Missing, Expiry date needed, Expired, Not provided, OK.
 *
 * Exact Decision Rules (Section 12.3 of Architecture):
 * 1. If no matched file:
 *    - if mandatory == true  -> "Missing" (blocking)
 *    - else                  -> "Not provided" (non-blocking)
 * 2. If matched file and has_expiry == true:
 *    - if expiryDate is null/empty -> "Expiry date needed" (blocking)
 *    - if expiryDate < submissionDeadline -> "Expired" (blocking)
 *    - if expiryDate >= submissionDeadline -> "OK" (non-blocking, includes same-day rule)
 * 3. If matched file and has_expiry == false:
 *    -> "OK" (non-blocking)
 */

export const STATUS = {
  MISSING: 'Missing',
  EXPIRY_DATE_NEEDED: 'Expiry date needed',
  EXPIRED: 'Expired',
  NOT_PROVIDED: 'Not provided',
  OK: 'OK'
};

export const BLOCKING_STATUSES = [
  STATUS.MISSING,
  STATUS.EXPIRY_DATE_NEEDED,
  STATUS.EXPIRED
];

/**
 * Check if a status is blocking for package generation.
 * @param {string} status
 * @returns {boolean}
 */
export function isBlocking(status) {
  return BLOCKING_STATUSES.includes(status);
}

/**
 * Compute the status of a single requirement.
 * @param {object} requirement { id, mandatory, has_expiry, ... }
 * @param {string|null} matchedFileId ID of the matched file (if any)
 * @param {string|null} expiryDate Expiry date string in YYYY-MM-DD (if any)
 * @param {string} [submissionDeadline=''] Deadline in YYYY-MM-DD
 * @returns {string} One of STATUS enum values
 */
export function computeStatus(requirement, matchedFileId, expiryDate, submissionDeadline = '') {
  if (!requirement) {
    return STATUS.NOT_PROVIDED;
  }

  // 1. No file matched
  if (!matchedFileId) {
    if (requirement.mandatory) {
      return STATUS.MISSING;
    }
    return STATUS.NOT_PROVIDED;
  }

  // 2. File is matched, check expiry if required
  if (requirement.has_expiry) {
    if (!expiryDate || !String(expiryDate).trim()) {
      return STATUS.EXPIRY_DATE_NEEDED;
    }

    const trimmedExpiry = String(expiryDate).trim();
    const trimmedDeadline = String(submissionDeadline || '').trim();

    // Lexicographic string comparison for YYYY-MM-DD
    if (trimmedDeadline && trimmedExpiry < trimmedDeadline) {
      return STATUS.EXPIRED;
    }

    // Includes same-day: trimmedExpiry >= trimmedDeadline
    return STATUS.OK;
  }

  // 3. File is matched and has_expiry is false
  return STATUS.OK;
}

/**
 * Recalculate statuses for all requirements.
 * @param {Array<object>} requirements
 * @param {Record<string, string|null>} matches
 * @param {Record<string, string|null>} expiryDates
 * @param {string} submissionDeadline
 * @returns {Record<string, string>} Map of requirementId -> status
 */
export function recalculateAllStatuses(requirements = [], matches = {}, expiryDates = {}, submissionDeadline = '') {
  const statuses = {};
  for (const req of requirements) {
    const matchedFileId = matches[req.id] || null;
    const expiryDate = expiryDates[req.id] || null;
    statuses[req.id] = computeStatus(req, matchedFileId, expiryDate, submissionDeadline);
  }
  return statuses;
}

/**
 * Get all requirements currently having blocking statuses.
 * @param {Record<string, string>} statuses Map of requirementId -> status
 * @param {Array<object>} requirements List of requirements
 * @param {string} [submissionDeadline=''] Deadline for context in messages
 * @param {Record<string, string|null>} [expiryDates={}] Expiry dates for context
 * @returns {Array<{ requirement: object, status: string, reason: string }>}
 */
export function getBlockingStatuses(statuses = {}, requirements = [], submissionDeadline = '', expiryDates = {}) {
  const blocking = [];

  for (const req of requirements) {
    const status = statuses[req.id];
    if (isBlocking(status)) {
      let reason = '';
      if (status === STATUS.MISSING) {
        reason = `Mandatory document is missing. A PDF file must be matched.`;
      } else if (status === STATUS.EXPIRY_DATE_NEEDED) {
        reason = `Expiry date is required for this document.`;
      } else if (status === STATUS.EXPIRED) {
        const exp = expiryDates[req.id] || 'Unknown';
        reason = `Document expired on ${exp} (submission deadline is ${submissionDeadline}).`;
      }

      blocking.push({
        requirement: req,
        status,
        reason
      });
    }
  }

  return blocking;
}
