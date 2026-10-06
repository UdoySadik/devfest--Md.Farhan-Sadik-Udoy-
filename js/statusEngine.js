/**
 * Status Engine Module (Stub - Phase 1)
 * Pure business logic for evaluating requirement statuses according to strict priority rules:
 * Missing, Expiry date needed, Expired, Not provided, OK.
 * Full implementation in Phase 4.
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
 * Compute the status of a single requirement.
 * @param {object} requirement
 * @param {string|null} matchedFileId
 * @param {string|null} expiryDate
 * @param {string} submissionDeadline
 * @returns {string}
 */
export function computeStatus(requirement, matchedFileId, expiryDate, submissionDeadline) {
  // Stub for Phase 1 - implemented in Phase 4
  return STATUS.NOT_PROVIDED;
}

/**
 * Recalculate statuses for all requirements in state.
 * @param {Array<object>} requirements
 * @param {Record<string, string|null>} matches
 * @param {Record<string, string|null>} expiryDates
 * @param {string} submissionDeadline
 * @returns {Record<string, string>}
 */
export function recalculateAllStatuses(requirements, matches, expiryDates, submissionDeadline) {
  // Stub for Phase 1 - implemented in Phase 4
  const statuses = {};
  for (const req of requirements) {
    statuses[req.id] = STATUS.NOT_PROVIDED;
  }
  return statuses;
}

/**
 * Get all requirements currently having blocking statuses.
 * @param {Record<string, string>} statuses
 * @param {Array<object>} requirements
 * @returns {Array<{ requirement: object, status: string }>}
 */
export function getBlockingStatuses(statuses, requirements) {
  // Stub for Phase 1 - implemented in Phase 4
  return [];
}
