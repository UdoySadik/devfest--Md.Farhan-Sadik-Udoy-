/**
 * Main UI Renderer Orchestrator
 * Coordinates rendering of all panels, updates i18n labels, and syncs DOM with AppState.
 */

import { getState } from '../state.js';
import { t } from '../i18n.js';
import { renderTenderInfo } from './tenderInfo.js';
import { renderFileUpload } from './fileUpload.js';
import { renderRequirementsList } from './requirementsList.js';

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

  // 5. Render Step 4 status / empty-state
  const blockingContainer = document.getElementById('blocking-reasons');
  if (blockingContainer) {
    if (!currentState.tender && (!currentState.requirements || currentState.requirements.length === 0)) {
      blockingContainer.classList.remove('hidden');
      blockingContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚡</div>
          <p class="empty-state-text">${t('generatePlaceholder')}</p>
        </div>
      `;
    }
  }

  // 6. Generate button state
  const btnGenerate = document.getElementById('btn-generate');
  if (btnGenerate) {
    const canGenerate = currentState.tender &&
      currentState.requirements.length > 0 &&
      !currentState.hasBlockingStatus &&
      !currentState.isGenerating;
    btnGenerate.disabled = !canGenerate;
  }
}
