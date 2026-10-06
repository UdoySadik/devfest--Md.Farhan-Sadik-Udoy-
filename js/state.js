/**
 * Central Application State Management
 * Follows an observable / subscriber pattern with automatic real-time status recalculation.
 */

import { recalculateAllStatuses, getBlockingStatuses } from './statusEngine.js';

const initialState = {
  // Loaded tender metadata
  tender: null,
  
  // Sorted list of requirements from requirements.json
  requirements: [],
  
  // List of uploaded PDF files with metadata and buffers
  uploadedFiles: [],
  
  // Matching map: requirementId -> fileId | null
  matches: {},
  
  // Expiry date map: requirementId -> 'YYYY-MM-DD' | null
  expiryDates: {},
  
  // Calculated document statuses: requirementId -> statusString
  statuses: {},
  
  // UI & Localization state
  language: 'en',
  
  // Package generation state
  isGenerating: false,
  generatedPackage: null,
  generationProgress: 0,
  
  // Status aggregation
  hasBlockingStatus: false,
  blockingReasons: []
};

let currentState = { ...initialState };
const listeners = new Set();

/**
 * Recompute statuses and blocking reasons for a given state state.
 */
function syncStatuses(state) {
  const deadline = state.tender?.submission_deadline || '';
  const statuses = recalculateAllStatuses(state.requirements, state.matches, state.expiryDates, deadline);
  const blocking = getBlockingStatuses(statuses, state.requirements, deadline, state.expiryDates);
  return {
    ...state,
    statuses,
    hasBlockingStatus: blocking.length > 0,
    blockingReasons: blocking
  };
}

/**
 * Get the current immutable snapshot of the application state.
 * @returns {typeof initialState}
 */
export function getState() {
  return currentState;
}

/**
 * Update application state and notify all subscribers.
 * Accepts either a partial state object or an updater function (state) => partialState.
 * @param {Partial<typeof initialState> | ((state: typeof initialState) => Partial<typeof initialState>)} updater
 */
export function updateState(updater) {
  const updates = typeof updater === 'function' ? updater(currentState) : updater;
  
  let nextState = {
    ...currentState,
    ...updates
  };

  // Keep statuses synchronized if requirements, matches, or expiryDates were updated
  if (updates.requirements !== undefined || updates.matches !== undefined || updates.expiryDates !== undefined || updates.tender !== undefined) {
    nextState = syncStatuses(nextState);
  }
  
  currentState = nextState;
  notifyListeners();
}

/**
 * Subscribe a callback to state changes.
 * @param {(state: typeof initialState) => void} listener
 * @returns {() => void} Unsubscribe function
 */
export function subscribe(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('Subscriber must be a function');
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Reset application state to initial blank state.
 */
export function resetState() {
  currentState = { ...initialState };
  notifyListeners();
}

/**
 * Helper to update tender details and sorted requirements.
 * Automatically initializes status calculations.
 * @param {object} tender
 * @param {Array<object>} requirements
 */
export function setTenderAndRequirements(tender, requirements) {
  updateState(prev => {
    const raw = {
      ...prev,
      tender,
      requirements: requirements || [],
      matches: {},
      expiryDates: {}
    };
    return syncStatuses(raw);
  });
}

/**
 * Helper to append newly uploaded files to state.
 * @param {Array<object>} newFiles
 */
export function addUploadedFiles(newFiles) {
  if (!newFiles || newFiles.length === 0) return;
  updateState(prev => ({
    uploadedFiles: [...prev.uploadedFiles, ...newFiles]
  }));
}

/**
 * Helper to remove an uploaded file by ID.
 * Automatically unmatches file and recalculates statuses.
 * @param {string} fileId
 */
export function removeUploadedFile(fileId) {
  updateState(prev => {
    const updatedFiles = prev.uploadedFiles.filter(f => f.fileId !== fileId);
    
    // Clean up match if this file was matched
    const updatedMatches = { ...prev.matches };
    let matchChanged = false;
    for (const [reqId, matchedId] of Object.entries(updatedMatches)) {
      if (matchedId === fileId) {
        delete updatedMatches[reqId];
        matchChanged = true;
      }
    }

    const next = {
      ...prev,
      uploadedFiles: updatedFiles,
      matches: matchChanged ? updatedMatches : prev.matches
    };
    return syncStatuses(next);
  });
}

/**
 * Helper to match a file to a requirement.
 * @param {string} requirementId
 * @param {string|null} fileId
 */
export function setMatch(requirementId, fileId) {
  updateState(prev => {
    const updatedMatches = { ...prev.matches };
    
    if (!fileId) {
      delete updatedMatches[requirementId];
    } else {
      // 1-to-1 constraint: Remove file from other requirements if assigned
      for (const [rId, mId] of Object.entries(updatedMatches)) {
        if (mId === fileId && rId !== requirementId) {
          delete updatedMatches[rId];
        }
      }
      updatedMatches[requirementId] = fileId;
    }

    const next = {
      ...prev,
      matches: updatedMatches
    };
    return syncStatuses(next);
  });
}

/**
 * Helper to unmatch a requirement.
 * @param {string} requirementId
 */
export function unmatchRequirementState(requirementId) {
  updateState(prev => {
    const updatedMatches = { ...prev.matches };
    delete updatedMatches[requirementId];

    // Optionally clear expiry date for this requirement
    const updatedExpiry = { ...prev.expiryDates };
    delete updatedExpiry[requirementId];

    const next = {
      ...prev,
      matches: updatedMatches,
      expiryDates: updatedExpiry
    };
    return syncStatuses(next);
  });
}

/**
 * Helper to update expiry date for a requirement.
 * @param {string} requirementId
 * @param {string} dateString 'YYYY-MM-DD'
 */
export function setRequirementExpiry(requirementId, dateString) {
  updateState(prev => {
    const updatedExpiry = {
      ...prev.expiryDates,
      [requirementId]: dateString ? String(dateString).trim() : null
    };

    const next = {
      ...prev,
      expiryDates: updatedExpiry
    };
    return syncStatuses(next);
  });
}

/**
 * Notify all registered listeners of state changes.
 */
function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener(currentState);
    } catch (error) {
      console.error('Error in state listener:', error);
    }
  }
}
