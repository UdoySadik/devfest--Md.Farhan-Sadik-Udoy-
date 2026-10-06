/**
 * Main Application Orchestrator (Phase 2 Implementation)
 * Bootstraps the application, wires language switching, JSON requirements loading,
 * multi-file PDF uploading, and UI rendering subscription.
 */

import { getState, subscribe, addUploadedFiles } from './state.js';
import { setLanguage } from './i18n.js';
import { renderAll } from './ui/renderer.js';
import { loadRequirements } from './requirementsLoader.js';
import { processFiles } from './fileProcessor.js';
import { showNotification } from './ui/notifications.js';

/**
 * Initialize the application on DOM ready.
 */
function initApp() {
  console.log('📦 Initializing Tender Document Package Builder (Phase 2)');

  // Verify external CDN libraries
  const pdfJsAvailable = typeof window.pdfjsLib !== 'undefined';
  const pdfLibAvailable = typeof window.PDFLib !== 'undefined';
  console.log(`[CDN Check] pdf.js: ${pdfJsAvailable ? 'Loaded ✅' : 'Missing ❌'}`);
  console.log(`[CDN Check] pdf-lib: ${pdfLibAvailable ? 'Loaded ✅' : 'Missing ❌'}`);

  // Prevent default browser drag-and-drop file opening
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  // Subscribe UI renderer to AppState changes
  subscribe((state) => {
    renderAll(state);
  });

  // ─── Language Switcher ───
  const btnEn = document.getElementById('btn-lang-en');
  const btnBn = document.getElementById('btn-lang-bn');

  btnEn?.addEventListener('click', () => {
    setLanguage('en');
  });

  btnBn?.addEventListener('click', () => {
    setLanguage('bn');
  });

  // ─── Step 1: Requirements JSON Upload ───
  const jsonFileInput = document.getElementById('json-file-input');
  const jsonUploadZone = document.getElementById('json-upload-zone');

  async function handleJsonFile(file) {
    if (!file) return;
    try {
      const result = await loadRequirements(file);
      showNotification(`Loaded tender: ${result.tender.tender_id} (${result.requirements.length} requirements)`, 'success');
    } catch (err) {
      console.error('Requirements load error:', err);
      showNotification(err.message || 'Failed to load requirements.json', 'error');
    }
  }

  jsonFileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleJsonFile(file);
      jsonFileInput.value = '';
    }
  });

  if (jsonUploadZone) {
    jsonUploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      jsonUploadZone.classList.add('drag-over');
    });

    jsonUploadZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      jsonUploadZone.classList.remove('drag-over');
    });

    jsonUploadZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      jsonUploadZone.classList.remove('drag-over');
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        await handleJsonFile(file);
      }
    });
  }

  // ─── Step 2: PDF Files Upload ───
  const pdfFileInput = document.getElementById('pdf-file-input');
  const pdfUploadZone = document.getElementById('pdf-upload-zone');

  async function handlePdfFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    try {
      const { validFiles, errors } = await processFiles(fileList, getState().uploadedFiles);

      // Report any errors encountered
      for (const err of errors) {
        showNotification(err, 'error', 5000);
      }

      // Add valid files to state
      if (validFiles.length > 0) {
        addUploadedFiles(validFiles);
        showNotification(`Successfully added ${validFiles.length} PDF file(s).`, 'success');
      }
    } catch (err) {
      console.error('PDF batch processing error:', err);
      showNotification(err.message || 'Error processing uploaded files.', 'error');
    }
  }

  pdfFileInput?.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handlePdfFiles(files);
      pdfFileInput.value = '';
    }
  });

  if (pdfUploadZone) {
    pdfUploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      pdfUploadZone.classList.add('drag-over');
    });

    pdfUploadZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      pdfUploadZone.classList.remove('drag-over');
    });

    pdfUploadZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      pdfUploadZone.classList.remove('drag-over');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        await handlePdfFiles(files);
      }
    });
  }

  // Initial render
  renderAll(getState());

  console.log('🚀 Tender Document Package Builder (Phase 2) initialized successfully');
}

// Bootstrap when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
