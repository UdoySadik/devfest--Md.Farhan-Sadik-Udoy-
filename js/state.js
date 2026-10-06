/**
 * Central Application State Management
 * Follows an observable / subscriber pattern with immutable state updates.
 */

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
  
  currentState = {
    ...currentState,
    ...updates
  };
  
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
