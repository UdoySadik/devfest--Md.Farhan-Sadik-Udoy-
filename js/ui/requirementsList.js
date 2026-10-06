/**
 * Requirements List UI Component (Phase 2 Implementation)
 * Renders sorted requirements table with Order, Document Name, Mandatory/Optional,
 * and Status placeholder.
 */

import { t, getDocTitle } from '../i18n.js';

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
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
    const mandatoryBadge = req.mandatory
      ? `<span class="badge badge--mandatory">${escapeHtml(t('mandatory'))}</span>`
      : `<span class="badge badge--optional">${escapeHtml(t('optional'))}</span>`;

    const expiryBadge = req.has_expiry
      ? `<span style="font-size: var(--font-size-xs); color: var(--status-warning);">⏱ Yes</span>`
      : `<span style="font-size: var(--font-size-xs); color: var(--text-muted);">&mdash;</span>`;

    // Phase 2 status placeholder
    const statusPlaceholder = `
      <span class="status-badge status-badge--not-provided">
        ${escapeHtml(t('statusNotProvided'))}
      </span>
    `;

    return `
      <tr data-req-id="${escapeHtml(req.id)}">
        <td style="font-weight: 700; width: 60px; text-align: center; color: var(--accent-start);">
          ${escapeHtml(req.order)}
        </td>
        <td style="font-weight: 500;">
          ${escapeHtml(title)}
        </td>
        <td style="width: 120px;">
          ${mandatoryBadge}
        </td>
        <td style="width: 110px;">
          ${expiryBadge}
        </td>
        <td style="width: 150px;">
          ${statusPlaceholder}
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="overflow-x: auto;">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 60px; text-align: center;">${escapeHtml(t('order'))}</th>
            <th>${escapeHtml(t('docTitle'))}</th>
            <th style="width: 120px;">${escapeHtml(t('type'))}</th>
            <th style="width: 110px;">Expiry Check</th>
            <th style="width: 150px;">${escapeHtml(t('status'))}</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}
