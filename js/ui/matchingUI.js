/**
 * Matching Interface UI Component (Phase 3 Full Implementation)
 * Renders file selector dropdowns, undo/unmatch buttons, and expiry date inputs.
 */

import { t } from '../i18n.js';
import { getAvailableFilesForRequirement } from '../matcher.js';

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Render the file matching selector (dropdown + undo button) for a requirement.
 * @param {object} requirement
 * @param {Array<object>} uploadedFiles
 * @param {Record<string, string|null>} matches
 * @returns {string} HTML string
 */
export function renderFileSelectorHtml(requirement, uploadedFiles = [], matches = {}) {
  const currentMatchedFileId = matches[requirement.id] || null;
  const availableFiles = getAvailableFilesForRequirement(requirement.id, uploadedFiles, matches);

  const optionsHtml = availableFiles.map(file => {
    const isSelected = file.fileId === currentMatchedFileId ? 'selected' : '';
    const pageLabel = file.pageCount === 1 ? '1 pg' : `${file.pageCount} pgs`;
    return `<option value="${escapeHtml(file.fileId)}" ${isSelected}>${escapeHtml(file.name)} (${pageLabel})</option>`;
  }).join('');

  const hasMatch = Boolean(currentMatchedFileId);

  return `
    <div style="display: flex; align-items: center; gap: var(--space-xs);">
      <select 
        class="form-input form-input-sm match-select" 
        data-req-id="${escapeHtml(requirement.id)}"
        style="min-width: 170px; max-width: 260px;"
      >
        <option value="">-- ${escapeHtml(t('selectFilePlaceholder'))} --</option>
        ${optionsHtml}
      </select>
      ${hasMatch ? `
        <button 
          type="button" 
          class="btn btn-ghost btn-small btn-unmatch" 
          data-req-id="${escapeHtml(requirement.id)}" 
          title="${escapeHtml(t('btnUnmatch'))}"
          style="padding: 4px 8px; color: var(--text-muted);"
        >
          ✕
        </button>
      ` : ''}
    </div>
  `;
}

/**
 * Render the expiry date input for a requirement.
 * @param {object} requirement
 * @param {string|null} matchedFileId
 * @param {string|null} currentDate
 * @returns {string} HTML string
 */
export function renderExpiryInputHtml(requirement, matchedFileId, currentDate) {
  if (!requirement.has_expiry) {
    return `<span style="color: var(--text-muted); font-size: var(--font-size-xs);">&mdash;</span>`;
  }

  if (!matchedFileId) {
    return `
      <span style="color: var(--text-muted); font-size: var(--font-size-xs); font-style: italic;">
        ${escapeHtml(t('matchFileFirst'))}
      </span>
    `;
  }

  return `
    <input 
      type="date" 
      class="form-input form-input-sm expiry-date-input" 
      data-req-id="${escapeHtml(requirement.id)}" 
      value="${escapeHtml(currentDate || '')}"
      style="padding: 4px 8px; width: 140px;"
    >
  `;
}

/**
 * Attach change/click listeners to matching UI elements in a container.
 * @param {HTMLElement} container
 * @param {object} callbacks { onMatch, onUnmatch, onExpiryChange }
 */
export function attachMatchingListeners(container, { onMatch, onUnmatch, onExpiryChange }) {
  if (!container) return;

  // 1. Dropdown selection changes
  const selectElements = container.querySelectorAll('.match-select');
  selectElements.forEach(select => {
    select.addEventListener('change', (e) => {
      const reqId = select.getAttribute('data-req-id');
      const fileId = select.value || null;
      if (reqId && onMatch) {
        onMatch(reqId, fileId);
      }
    });
  });

  // 2. Undo / unmatch buttons
  const unmatchButtons = container.querySelectorAll('.btn-unmatch');
  unmatchButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const reqId = btn.getAttribute('data-req-id');
      if (reqId && onUnmatch) {
        onUnmatch(reqId);
      }
    });
  });

  // 3. Expiry date inputs
  const expiryInputs = container.querySelectorAll('.expiry-date-input');
  expiryInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const reqId = input.getAttribute('data-req-id');
      const dateVal = input.value;
      if (reqId && onExpiryChange) {
        onExpiryChange(reqId, dateVal);
      }
    });
  });
}
