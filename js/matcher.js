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
 * and available uploaded files using global score-ranked resemblance.
 * Uses global score sorting so exact multi-word matches (like Financial Proposal)
 * are prioritized over single-token partial matches.
 * @param {Array<object>} requirements
 * @param {Array<object>} uploadedFiles
 * @param {Record<string, string|null>} currentMatches
 * @param {number} [targetYear=2026]
 * @returns {{ suggestions: Record<string, string>, count: number }}
 */
export function suggestMatches(requirements = [], uploadedFiles = [], currentMatches = {}, targetYear = 2026) {
  const suggestions = {};
  const currentAssignedFiles = new Set(Object.values(currentMatches).filter(Boolean));
  const assignedReqs = new Set(Object.keys(currentMatches).filter(k => Boolean(currentMatches[k])));

  // Calculate scores for all candidate pairs (unmatched requirement, available file)
  const candidatePairs = [];

  for (const req of requirements) {
    if (assignedReqs.has(req.id)) continue;

    const enNorm = normalizeName(req.title_en);
    const bnNorm = normalizeName(req.title_bn);
    const enTokens = enNorm.split(' ').filter(w => w.length > 2);
    const bnTokens = bnNorm.split(' ').filter(w => w.length > 2);

    for (const file of uploadedFiles) {
      if (currentAssignedFiles.has(file.fileId)) continue;
      const check = canMatchFile(file.fileId, req.id, currentMatches, uploadedFiles);
      if (!check.allowed) continue;

      const fileNorm = normalizeName(file.name);
      const fileTokens = fileNorm.split(' ');

      let score = 0;

      // Exact full title match (e.g. 'financial proposal' in '01 financial proposal')
      if (enNorm && fileNorm.includes(enNorm)) {
        score += 25;
      }
      if (bnNorm && fileNorm.includes(bnNorm)) {
        score += 25;
      }

      // Token matches
      let matchedTokens = 0;
      for (const token of enTokens) {
        if (fileTokens.includes(token) || fileNorm.includes(token)) {
          score += 6;
          matchedTokens++;
        }
      }
      for (const token of bnTokens) {
        if (fileTokens.includes(token) || fileNorm.includes(token)) {
          score += 6;
          matchedTokens++;
        }
      }

      // Bonus if all title tokens match
      if (enTokens.length > 1 && matchedTokens >= enTokens.length) {
        score += 15;
      }

      // Year preference: if filename has year >= targetYear (e.g. 2026 vs 2025)
      const yearMatch = fileNorm.match(/\b(20\d{2})\b/);
      if (yearMatch) {
        const fileYear = parseInt(yearMatch[1], 10);
        if (fileYear >= targetYear) {
          score += 5;
        }
      }

      // Small bonus for mandatory requirements to resolve ties
      if (req.mandatory) {
        score += 2;
      }

      if (score >= 6) {
        candidatePairs.push({
          reqId: req.id,
          fileId: file.fileId,
          score
        });
      }
    }
  }

  // Sort candidate pairs by score descending
  candidatePairs.sort((a, b) => b.score - a.score);

  const matchedReqIds = new Set();
  const matchedFileIds = new Set();

  for (const pair of candidatePairs) {
    if (matchedReqIds.has(pair.reqId) || matchedFileIds.has(pair.fileId)) continue;

    const mockMatches = { ...currentMatches, ...suggestions };
    const check = canMatchFile(pair.fileId, pair.reqId, mockMatches, uploadedFiles);
    if (!check.allowed) continue;

    suggestions[pair.reqId] = pair.fileId;
    matchedReqIds.add(pair.reqId);
    matchedFileIds.add(pair.fileId);
  }

  // Fallback pass: If exactly 1 mandatory requirement remains unmatched and exactly 1 non-duplicate file remains
  const remainingMandatory = requirements.filter(r => r.mandatory && !currentMatches[r.id] && !suggestions[r.id]);
  const allUsedFileIds = new Set([...currentAssignedFiles, ...matchedFileIds]);
  const remainingFiles = uploadedFiles.filter(f => !allUsedFileIds.has(f.fileId));

  if (remainingMandatory.length === 1 && remainingFiles.length >= 1) {
    const candidateFile = remainingFiles.find(f => {
      const mockMatches = { ...currentMatches, ...suggestions };
      return canMatchFile(f.fileId, remainingMandatory[0].id, mockMatches, uploadedFiles).allowed;
    });
    if (candidateFile) {
      suggestions[remainingMandatory[0].id] = candidateFile.fileId;
    }
  }

  return {
    suggestions,
    count: Object.keys(suggestions).length
  };
}
