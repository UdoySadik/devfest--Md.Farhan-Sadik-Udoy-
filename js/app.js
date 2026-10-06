/**
 * Main Application Orchestrator
 * Bootstraps the application, wires language switching, subscribes UI renderer to AppState.
 */

import { getState, subscribe } from './state.js';
import { setLanguage } from './i18n.js';
import { renderAll } from './ui/renderer.js';

/**
 * Initialize the application on DOM ready.
 */
function initApp() {
  console.log('📦 Initializing Tender Document Package Builder (Phase 1)');

  // Verify external CDN libraries
  const pdfJsAvailable = typeof window.pdfjsLib !== 'undefined';
  const pdfLibAvailable = typeof window.PDFLib !== 'undefined';
  console.log(`[CDN Check] pdf.js: ${pdfJsAvailable ? 'Loaded ✅' : 'Missing ❌'}`);
  console.log(`[CDN Check] pdf-lib: ${pdfLibAvailable ? 'Loaded ✅' : 'Missing ❌'}`);

  // Subscribe UI renderer to AppState changes
  subscribe((state) => {
    renderAll(state);
  });

  // Wire Language Switcher
  const btnEn = document.getElementById('btn-lang-en');
  const btnBn = document.getElementById('btn-lang-bn');

  btnEn?.addEventListener('click', () => {
    setLanguage('en');
  });

  btnBn?.addEventListener('click', () => {
    setLanguage('bn');
  });

  // Initial render
  renderAll(getState());

  console.log('🚀 Phase 1 Foundation & UI Shell initialized successfully');
}

// Bootstrap when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
