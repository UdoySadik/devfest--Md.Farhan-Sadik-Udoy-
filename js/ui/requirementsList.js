/**
 * Requirements List UI Component (Phase 3 Full Implementation)
 * Renders sorted requirements table with Order, Document Name, Mandatory/Optional,
 * Matched File Selector, Expiry Input, and Real-Time Status Badges.
 */

import { t, getDocTitle } from '../i18n.js';
import { STATUS } from '../statusEngine.js';
import { renderFileSelectorHtml, renderExpiryInputHtml, attachMatchingListeners } from './matchingUI.js';
import { matchFileToRequirement } from '../matcher.js';
import { getState, setMatch, unmatchRequirementState, setRequirementExpiry } from '../state.js';
import { showNotification } from './notifications.js';

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Return styled status badge HTML based on status value.
 * @param {string} status
 * @returns {string}
 */
function renderStatusBadge(status) {
  switch (status) {
    case STATUS.OK:
      return `<span class="status-badge status-badge--ok">✓ ${escapeHtml(t('statusOk'))}</span>`;
    case STATUS.MISSING:
      return `<span class="status-badge status-badge--missing">⚠ ${escapeHtml(t('statusMissing'))}</span>`;
    case STATUS.EXPIRY_DATE_NEEDED:
      return `<span class="status-badge status-badge--expiry-needed">⏱ ${escapeHtml(t('statusExpiryNeeded'))}</span>`;
    case STATUS.EXPIRED:
      return `<span class="status-badge status-badge--expired">✕ ${escapeHtml(t('statusExpired'))}</span>`;
    case STATUS.NOT_PROVIDED:
      return `<span class="status-badge status-badge--not-provided">${escapeHtml(t('statusNotProvided'))}</span>`;
    default:
      return `<span class="status-badge status-badge--not-provided">${escapeHtml(status || '')}</span>`;
  }
}

/**
 * Render requirements list or empty state placeholder.
 * @param {HTMLElement} container
 * @param {Array<object>} requirements
 * @param {Record<string, string>} [statuses={}]
 * @param {Record<string, string|null>} [matches={}]
 * @param {Record<string, string|null>} [expiryDates={}]
 * @param {Array<object>} [uploadedFiles=[]]
 */
export function renderRequirementsList(
  container,
  requirements = [],
  statuses = {},
  matches = {},
  expiryDates = {},
  uploadedFiles = []
) {
  if (!container) return;

  if (!requirements || requirements.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p class="empty-state-text">${escapeHtml(t('requirementsPlaceholder'))}</p>
      </div>
    `;
    return;
  }

  const rowsHtml = requirements.map((req) => {
    const title = getDocTitle(req);
    const matchedFileId = matches[req.id] || null;
    const currentExpiry = expiryDates[req.id] || null;
    const currentStatus = statuses[req.id] || (req.mandatory ? STATUS.MISSING : STATUS.NOT_PROVIDED);

    const mandatoryBadge = req.mandatory
      ? `<span class="badge badge--mandatory">${escapeHtml(t('mandatory'))}</span>`
      : `<span class="badge badge--optional">${escapeHtml(t('optional'))}</span>`;

    const selectorHtml = renderFileSelectorHtml(req, uploadedFiles, matches);
    const expiryHtml = renderExpiryInputHtml(req, matchedFileId, currentExpiry);
    const badgeHtml = renderStatusBadge(currentStatus);

    return `
      <tr data-req-id="${escapeHtml(req.id)}">
        <td style="font-weight: 700; width: 50px; text-align: center; color: var(--accent-start);">
          ${escapeHtml(req.order)}
        </td>
        <td style="font-weight: 600; min-width: 160px;">
          ${escapeHtml(title)}
        </td>
        <td style="width: 110px;">
          ${mandatoryBadge}
        </td>
        <td style="min-width: 200px;">
          ${selectorHtml}
        </td>
        <td style="width: 160px;">
          ${expiryHtml}
        </td>
        <td style="width: 170px;">
          ${badgeHtml}
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px; text-align: center;">${escapeHtml(t('order'))}</th>
            <th>${escapeHtml(t('docTitle'))}</th>
            <th style="width: 110px;">${escapeHtml(t('type'))}</th>
            <th style="min-width: 200px;">${escapeHtml(t('matchedFile'))}</th>
            <th style="width: 160px;">${escapeHtml(t('expiryDate'))}</th>
            <th style="width: 170px;">${escapeHtml(t('status'))}</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;

  // Attach interactive listeners for matching and expiry changes
  attachMatchingListeners(container, {
    onMatch: (reqId, fileId) => {
      const state = getState();
      const matchResult = matchFileToRequirement(reqId, fileId, state.matches, state.uploadedFiles);
      if (!matchResult.success) {
        showNotification(matchResult.reason || 'Could not match file.', 'warning');
        // Re-render to revert selector
        renderRequirementsList(container, requirements, statuses, matches, expiryDates, uploadedFiles);
        return;
      }
      setMatch(reqId, fileId);
    },
    onUnmatch: (reqId) => {
      unmatchRequirementState(reqId);
    },
    onExpiryChange: (reqId, dateVal) => {
      setRequirementExpiry(reqId, dateVal);
    }
  });
}
