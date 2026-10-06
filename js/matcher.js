/**
 * Matcher Module (Phase 4 Full Implementation)
 * Enforces strict 1-to-1 requirement ↔ file mapping and duplicate constraints.
 * Allows change and undo operations at any time.
 */

import { canMatchFile } from './duplicateDetector.js';

/**
 * Assign a file to a requirement, enforcing 1-to-1 and duplicate constraints.
 * @param {string} requirementId Target requirement ID
 * @param {string|null} fileId Uploaded file ID (or null to unmatch)
 * @param {Record<string, string|null>} currentMatches Current match mappings
 * @param {Array<object>} [files=[]] List of uploaded files
 * @returns {{ success: boolean, matches: Record<string, string|null>, reason?: string }}
 */
export function matchFileToRequirement(requirementId, fileId, currentMatches = {}, files = []) {
  const newMatches = { ...currentMatches };

  // If fileId is null or empty, this is an unmatch operation
  if (!fileId) {
    delete newMatches[requirementId];
    return { success: true, matches: newMatches };
  }

  const targetFile = files.find(f => f.fileId === fileId);
  if (!targetFile) {
    return { success: false, matches: currentMatches, reason: 'File not found.' };
  }

  // Duplicate constraint check via duplicateDetector
  const duplicateCheck = canMatchFile(fileId, requirementId, currentMatches, files);
  if (!duplicateCheck.allowed) {
    return {
      success: false,
      matches: currentMatches,
      reason: duplicateCheck.reason || 'This duplicate file is already matched to another requirement.'
    };
  }

  // Enforce 1-to-1 constraint:
  // If the file was matched elsewhere, remove it from that requirement
  for (const [rId, matchedFId] of Object.entries(newMatches)) {
    if (matchedFId === fileId && rId !== requirementId) {
      delete newMatches[rId];
    }
  }

  // Assign file to requirement
  newMatches[requirementId] = fileId;
  return { success: true, matches: newMatches };
}

/**
 * Remove an assignment from a requirement.
 * @param {string} requirementId
 * @param {Record<string, string|null>} currentMatches
 * @returns {Record<string, string|null>} New matches object
 */
export function unmatchRequirement(requirementId, currentMatches = {}) {
  const newMatches = { ...currentMatches };
  delete newMatches[requirementId];
  return newMatches;
}

/**
 * Get all files available to be selected for a specific requirement.
 * (Files not matched to another requirement, and not in violation of duplicate rules).
 * @param {string} requirementId
 * @param {Array<object>} uploadedFiles
 * @param {Record<string, string|null>} currentMatches
 * @returns {Array<object>}
 */
export function getAvailableFilesForRequirement(requirementId, uploadedFiles = [], currentMatches = {}) {
  const currentMatchedFileId = currentMatches[requirementId] || null;

  return uploadedFiles.filter(file => {
    // Current file matched to this requirement is always included
    if (file.fileId === currentMatchedFileId) {
      return true;
    }

    // Check if matched to another requirement
    const isMatchedElsewhere = Object.entries(currentMatches).some(
      ([rId, fId]) => rId !== requirementId && fId === file.fileId
    );
    if (isMatchedElsewhere) {
      return false;
    }

    // Check duplicate constraint
    const check = canMatchFile(file.fileId, requirementId, currentMatches, uploadedFiles);
    if (!check.allowed) {
      return false;
    }

    return true;
  });
}
