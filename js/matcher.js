/**
 * Matcher Module (Phase 4 & 6 B6 Implementation)
 * Enforces strict 1-to-1 requirement ↔ file mapping and duplicate constraints.
 * Provides B6 auto-match suggestions based on filename and requirement title similarity.
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

/**
 * Normalize text for similarity comparison.
 * @param {string} text
 * @returns {string}
 */
function normalizeName(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\.pdf$/i, '')
    .replace(/[_\-\.\,\(\)\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * B6 Bonus Feature: Compute auto-match suggestions between unmatched requirements
 * and available uploaded files using filename-to-title resemblance.
 * @param {Array<object>} requirements
 * @param {Array<object>} uploadedFiles
 * @param {Record<string, string|null>} currentMatches
 * @returns {{ suggestions: Record<string, string>, count: number }}
 */
export function suggestMatches(requirements = [], uploadedFiles = [], currentMatches = {}) {
  const suggestions = {};
  const assignedFileIds = new Set(Object.values(currentMatches).filter(Boolean));

  for (const req of requirements) {
    // Skip if already matched
    if (currentMatches[req.id]) continue;

    const enNorm = normalizeName(req.title_en);
    const bnNorm = normalizeName(req.title_bn);
    const enTokens = enNorm.split(' ').filter(w => w.length > 2);
    const bnTokens = bnNorm.split(' ').filter(w => w.length > 2);

    let bestMatchFile = null;
    let highestScore = 0;

    for (const file of uploadedFiles) {
      // Must not be already assigned
      if (assignedFileIds.has(file.fileId)) continue;

      // Duplicate constraint check
      const check = canMatchFile(file.fileId, req.id, currentMatches, uploadedFiles);
      if (!check.allowed) continue;

      const fileNorm = normalizeName(file.name);
      const fileTokens = fileNorm.split(' ');

      // Check substring inclusion
      let score = 0;
      if (enNorm && fileNorm.includes(enNorm)) {
        score += 10;
      }
      if (bnNorm && fileNorm.includes(bnNorm)) {
        score += 10;
      }

      // Check token matches (e.g. 'trade', 'license', 'tin')
      for (const token of enTokens) {
        if (fileTokens.includes(token) || fileNorm.includes(token)) {
          score += 3;
        }
      }
      for (const token of bnTokens) {
        if (fileTokens.includes(token) || fileNorm.includes(token)) {
          score += 3;
        }
      }

      // Check if requirement ID or order is in filename (e.g. "R01", "doc1", "1_")
      const reqIdNorm = req.id.toLowerCase();
      const orderToken = `doc${req.order}`;
      if (fileNorm.includes(reqIdNorm) || fileNorm.includes(orderToken)) {
        score += 4;
      }

      if (score > highestScore && score >= 3) {
        highestScore = score;
        bestMatchFile = file;
      }
    }

    if (bestMatchFile) {
      suggestions[req.id] = bestMatchFile.fileId;
      assignedFileIds.add(bestMatchFile.fileId);
    }
  }

  return {
    suggestions,
    count: Object.keys(suggestions).length
  };
}
