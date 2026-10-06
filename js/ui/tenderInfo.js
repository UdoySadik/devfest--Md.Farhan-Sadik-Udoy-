/**
 * Tender Information Panel UI Component (Phase 2 Implementation)
 * Renders tender metadata: ID, title, procuring entity, bidder, submission deadline.
 */

import { t } from '../i18n.js';

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Render tender information or empty placeholder state.
 * @param {HTMLElement} container
 * @param {object|null} tender
 */
export function renderTenderInfo(container, tender) {
  if (!container) return;

  if (!tender) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏢</div>
        <p class="empty-state-text">${escapeHtml(t('tenderInfoPlaceholder'))}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="tender-info-grid">
      <div class="tender-info-item">
        <div class="tender-info-label">${escapeHtml(t('tenderId'))}</div>
        <div class="tender-info-value" style="color: var(--accent-start); font-family: monospace; font-size: 1.05rem;">
          ${escapeHtml(tender.tender_id)}
        </div>
      </div>
      <div class="tender-info-item" style="grid-column: span 2;">
        <div class="tender-info-label">${escapeHtml(t('tenderTitle'))}</div>
        <div class="tender-info-value">${escapeHtml(tender.title)}</div>
      </div>
      <div class="tender-info-item">
        <div class="tender-info-label">${escapeHtml(t('procuringEntity'))}</div>
        <div class="tender-info-value">${escapeHtml(tender.procuring_entity)}</div>
      </div>
      <div class="tender-info-item">
        <div class="tender-info-label">${escapeHtml(t('bidder'))}</div>
        <div class="tender-info-value">${escapeHtml(tender.bidder)}</div>
      </div>
      <div class="tender-info-item">
        <div class="tender-info-label">${escapeHtml(t('deadline'))}</div>
        <div class="tender-info-value" style="color: var(--status-warning);">
          📅 ${escapeHtml(tender.submission_deadline)}
        </div>
      </div>
    </div>
  `;
}
