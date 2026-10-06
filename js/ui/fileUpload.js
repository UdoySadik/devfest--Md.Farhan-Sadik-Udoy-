/**
 * File Upload UI Component (Phase 2 Implementation)
 * Renders uploaded files list, page counts, file sizes, remove buttons, and summary stats.
 */

import { t } from '../i18n.js';
import { removeFile, MAX_FILES, MAX_TOTAL_SIZE } from '../fileProcessor.js';

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

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
        <p class="empty-state-text">${escapeHtml(t('filesPlaceholder'))}</p>
      </div>
    `;
    return;
  }

  const totalSize = uploadedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalPages = uploadedFiles.reduce((acc, f) => acc + (f.pageCount || 0), 0);

  // Stats bar
  const statsHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md); padding: var(--space-sm) var(--space-md); background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: var(--font-size-xs); color: var(--text-secondary);">
      <div>
        <span>Files: <strong style="color: var(--text-primary);">${uploadedFiles.length}</strong> / ${MAX_FILES}</span>
        <span style="margin: 0 var(--space-sm); opacity: 0.3;">|</span>
        <span>Total Pages: <strong style="color: var(--text-primary);">${totalPages}</strong></span>
      </div>
      <div>
        <span>Size: <strong style="color: var(--text-primary);">${formatBytes(totalSize)}</strong> / 50 MB</span>
      </div>
    </div>
  `;

  // List of files
  const itemsHtml = uploadedFiles.map((file) => {
    return `
      <div class="file-item" data-file-id="${escapeHtml(file.fileId)}">
        <div class="file-item-info">
          <span class="file-item-icon">📄</span>
          <div style="min-width: 0;">
            <div class="file-item-name" title="${escapeHtml(file.name)}">
              ${escapeHtml(file.name)}
            </div>
            <div class="file-item-meta">
              <span style="color: var(--accent-start); font-weight: 500;">
                ${file.pageCount} ${file.pageCount === 1 ? 'page' : 'pages'}
              </span>
              <span style="margin: 0 4px; opacity: 0.4;">&bull;</span>
              <span>${formatBytes(file.size)}</span>
            </div>
          </div>
        </div>
        <div class="file-item-actions">
          <button 
            type="button"
            class="btn btn-ghost btn-small btn-remove-file"
            data-file-id="${escapeHtml(file.fileId)}"
            title="${escapeHtml(t('btnRemove'))}"
            style="color: var(--status-error); border-color: rgba(239, 68, 68, 0.2);"
          >
            ✕ ${escapeHtml(t('btnRemove'))}
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${statsHtml}
    <div class="file-list">
      ${itemsHtml}
    </div>
  `;

  // Attach remove handlers
  const removeButtons = container.querySelectorAll('.btn-remove-file');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const fileId = btn.getAttribute('data-file-id');
      if (fileId) {
        removeFile(fileId);
      }
    });
  });
}
