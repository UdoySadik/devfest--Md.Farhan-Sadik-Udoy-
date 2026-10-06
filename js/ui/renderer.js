/**
 * Main UI Renderer Orchestrator (Phase 4 & 5 Full Implementation)
 * Coordinates rendering of all panels, updates i18n labels, blocking reasons,
 * generation progress, download buttons, and DOM state synchronization.
 */

import { getState } from '../state.js';
import { t, getDocTitle } from '../i18n.js';
import { renderTenderInfo } from './tenderInfo.js';
import { renderFileUpload } from './fileUpload.js';
import { renderRequirementsList } from './requirementsList.js';

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

/**
 * Update all localized text in the DOM based on current language.
 */
export function updateLocalizedTexts() {
  const state = getState();
  const lang = state.language || 'en';

  // Update HTML document language attribute
  document.documentElement.lang = lang;

  // Language switcher active button
  const btnEn = document.getElementById('btn-lang-en');
  const btnBn = document.getElementById('btn-lang-bn');
  if (btnEn && btnBn) {
    if (lang === 'en') {
      btnEn.classList.add('active');
      btnBn.classList.remove('active');
    } else {
      btnBn.classList.add('active');
      btnEn.classList.remove('active');
    }
  }

  // App Title
  const appTitle = document.getElementById('app-title');
  if (appTitle) appTitle.textContent = t('appTitle');

  // Section Headers
  const secLoadTitle = document.getElementById('section-load-title');
  if (secLoadTitle) secLoadTitle.textContent = t('step1Title');

  const secTenderTitle = document.getElementById('section-tender-title');
  if (secTenderTitle) secTenderTitle.textContent = t('tenderInfoTitle');

  const secUploadTitle = document.getElementById('section-upload-title');
  if (secUploadTitle) secUploadTitle.textContent = t('step2Title');

  const secReqTitle = document.getElementById('section-requirements-title');
  if (secReqTitle) secReqTitle.textContent = t('step3Title');

  const secGenTitle = document.getElementById('section-generate-title');
  if (secGenTitle) secGenTitle.textContent = t('step4Title');

  // Upload Zone Prompts
  const jsonUploadText = document.getElementById('json-upload-text');
  if (jsonUploadText) jsonUploadText.textContent = t('jsonUploadPrompt');

  const pdfUploadText = document.getElementById('pdf-upload-text');
  if (pdfUploadText) pdfUploadText.textContent = t('pdfUploadPrompt');

  // Buttons
  const btnGenText = document.getElementById('btn-generate-text');
  if (btnGenText) {
    btnGenText.textContent = state.isGenerating ? t('btnGenerating') : t('btnGenerate');
  }

  const btnDownloadText = document.getElementById('btn-download-text');
  if (btnDownloadText) btnDownloadText.textContent = t('btnDownload');

  // Footer
  const footerText = document.getElementById('footer-text');
  if (footerText) footerText.textContent = t('footerText');
}

/**
 * Main render function that calls each component renderer and updates localized strings.
 * @param {object} [state] Optional state snapshot (defaults to getState())
 */
export function renderAll(state) {
  const currentState = state || getState();

  // 1. Update text strings for current language
  updateLocalizedTexts();

  // 2. Render Tender Info panel
  const tenderInfoContainer = document.getElementById('tender-info-content');
  if (tenderInfoContainer) {
    renderTenderInfo(tenderInfoContainer, currentState.tender);
  }

  // 3. Render File List in Upload section
  const fileListContainer = document.getElementById('file-list-container');
  if (fileListContainer) {
    renderFileUpload(fileListContainer, currentState.uploadedFiles);
  }

  // 4. Render Requirements list & matching
  const reqContainer = document.getElementById('requirements-content');
  if (reqContainer) {
    renderRequirementsList(
      reqContainer,
      currentState.requirements,
      currentState.statuses,
      currentState.matches,
      currentState.expiryDates,
      currentState.uploadedFiles
    );
  }

  // 5. Render Step 4 status / blocking reasons / empty-state
  const blockingContainer = document.getElementById('blocking-reasons');
  if (blockingContainer) {
    if (!currentState.tender || currentState.requirements.length === 0) {
      // No tender loaded yet
      blockingContainer.className = 'blocking-reasons';
      blockingContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚡</div>
          <p class="empty-state-text">${escapeHtml(t('generatePlaceholder'))}</p>
        </div>
      `;
    } else if (currentState.hasBlockingStatus) {
      // Has blocking issues
      const reasonsList = currentState.blockingReasons.map(item => {
        const docName = getDocTitle(item.requirement);
        return `<li><strong>${escapeHtml(docName)}:</strong> ${escapeHtml(item.reason)}</li>`;
      }).join('');

      blockingContainer.className = 'blocking-reasons';
      blockingContainer.innerHTML = `
        <h3 style="color: var(--status-error); margin-bottom: var(--space-xs); font-weight: 600;">
          ⚠️ ${escapeHtml(t('cannotGenerate'))} (${currentState.blockingReasons.length} ${escapeHtml(t('issuesRequireAttention'))})
        </h3>
        <ul style="margin-top: var(--space-xs);">
          ${reasonsList}
        </ul>
      `;
    } else {
      // Ready to generate!
      blockingContainer.className = '';
      blockingContainer.innerHTML = `
        <div style="background: var(--status-ok-bg); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: var(--radius-md); padding: var(--space-md) var(--space-lg); margin-bottom: var(--space-lg); color: var(--status-ok); display: flex; align-items: center; gap: var(--space-md);">
          <span style="font-size: 1.5rem;">✅</span>
          <div>
            <div style="font-weight: 600;">${escapeHtml(t('readyToGenerate'))}</div>
            <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">
              ${escapeHtml(t('readyToGenerateDesc'))}
            </p>
          </div>
        </div>
      `;
    }
  }

  // 6. Generate button state
  const btnGenerate = document.getElementById('btn-generate');
  if (btnGenerate) {
    const canGenerate = Boolean(currentState.tender) &&
      currentState.requirements.length > 0 &&
      !currentState.hasBlockingStatus &&
      !currentState.isGenerating;
    btnGenerate.disabled = !canGenerate;
  }

  // 7. Download button visibility
  const btnDownload = document.getElementById('btn-download');
  if (btnDownload) {
    if (currentState.generatedBlob) {
      btnDownload.classList.remove('hidden');
    } else {
      btnDownload.classList.add('hidden');
    }
  }

  // 8. Progress container visibility and bar
  const progressContainer = document.getElementById('generation-progress');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  if (progressContainer && progressFill) {
    if (currentState.isGenerating) {
      progressContainer.classList.remove('hidden');
      progressFill.style.width = `${currentState.generationProgress || 0}%`;
    } else {
      progressContainer.classList.add('hidden');
    }
  }
}
