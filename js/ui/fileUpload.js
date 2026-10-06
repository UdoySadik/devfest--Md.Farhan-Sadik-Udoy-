/**
 * File Upload UI Component
 * Renders uploaded files list, file stats, duplicate badges, and empty state.
 * Full interactive handling implemented in Phase 2.
 */

import { t } from '../i18n.js';

/**
 * Render file list container inside Step 2.
 * @param {HTMLElement} container
 * @param {Array<object>} uploadedFiles
 */
export function renderFileUpload(container, uploadedFiles = []) {
  if (!container) return;

  if (!uploadedFiles || uploadedFiles.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📁</div>
        <p class="empty-state-text">${t('filesPlaceholder')}</p>
      </div>
    `;
    return;
  }

  // File list rendering implemented in Phase 2
  container.innerHTML = `<div class="file-list"></div>`;
}
