/**
 * Matcher Module (Phase 3 Full Implementation)
 * Enforces strict 1-to-1 requirement ↔ file mapping and duplicate constraints.
 * Allows change and undo operations at any time.
 */

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

  // Duplicate constraint check:
  // Cannot match two files with identical contentHash to different requirements
  if (targetFile.contentHash) {
    for (const [rId, matchedFId] of Object.entries(currentMatches)) {
      if (rId !== requirementId && matchedFId !== fileId) {
        const otherFile = files.find(f => f.fileId === matchedFId);
        if (otherFile && otherFile.contentHash === targetFile.contentHash) {
          return {
            success: false,
            matches: currentMatches,
            reason: `This file has identical content to "${otherFile.name}", which is already matched to another requirement.`
          };
        }
      }
    }
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
 * (Files not matched to another requirement, and not sharing contentHash with another matched file).
 * @param {string} requirementId
 * @param {Array<object>} uploadedFiles
 * @param {Record<string, string|null>} currentMatches
 * @returns {Array<object>}
 */
export function getAvailableFilesForRequirement(requirementId, uploadedFiles = [], currentMatches = {}) {
  const currentMatchedFileId = currentMatches[requirementId] || null;

  // Find hashes of files matched to other requirements
  const otherMatchedHashes = new Set();
  for (const [rId, fId] of Object.entries(currentMatches)) {
    if (rId !== requirementId && fId) {
      const f = uploadedFiles.find(item => item.fileId === fId);
      if (f && f.contentHash) {
        otherMatchedHashes.add(f.contentHash);
      }
    }
  }

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
    if (file.contentHash && otherMatchedHashes.has(file.contentHash)) {
      return false;
    }

    return true;
  });
}
