/**
 * Tender Information Panel UI Component
 * Renders tender metadata (ID, title, procuring entity, bidder, submission deadline)
 * or placeholder empty state in Phase 1.
 */

import { t } from '../i18n.js';

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
        <p class="empty-state-text">${t('tenderInfoPlaceholder')}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="tender-info-grid">
      <div class="info-card">
        <span class="info-label">${t('tenderId')}</span>
        <span class="info-value text-accent">${tender.tender_id || '-'}</span>
      </div>
      <div class="info-card">
        <span class="info-label">${t('tenderTitle')}</span>
        <span class="info-value font-medium">${tender.title || '-'}</span>
      </div>
      <div class="info-card">
        <span class="info-label">${t('procuringEntity')}</span>
        <span class="info-value">${tender.procuring_entity || '-'}</span>
      </div>
      <div class="info-card">
        <span class="info-label">${t('bidder')}</span>
        <span class="info-value">${tender.bidder || '-'}</span>
      </div>
      <div class="info-card">
        <span class="info-label">${t('deadline')}</span>
        <span class="info-value text-warning">${tender.submission_deadline || '-'}</span>
      </div>
    </div>
  `;
}
