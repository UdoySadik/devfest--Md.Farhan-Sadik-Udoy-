/**
 * Duplicate Detector Module (Phase 4 Full Implementation)
 * Content-hash-based exact duplicate detection using SHA-256 digests.
 * Identifies duplicate groups and prevents duplicate matching across different requirements.
 */

/**
 * Identify duplicate files by grouping on contentHash.
 * Updates isDuplicate and duplicateGroupId for each file.
 * Recalculates dynamically whenever files are added or removed.
 * @param {Array<object>} files
 * @returns {Array<object>} Updated files array
 */
export function detectDuplicates(files = []) {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  // Group files by contentHash
  const groups = new Map();
  for (const file of files) {
    if (!file.contentHash) continue;
    if (!groups.has(file.contentHash)) {
      groups.set(file.contentHash, []);
    }
    groups.get(file.contentHash).push(file);
  }

  // Update duplicate flags
  return files.map(file => {
    const group = groups.get(file.contentHash) || [];
    const isDuplicate = group.length > 1;
    return {
      ...file,
      isDuplicate,
      duplicateGroupId: isDuplicate ? file.contentHash : null
    };
  });
}

/**
 * Validate whether a file can be matched to a requirement under duplicate constraints.
 * Rule: Files within the same duplicate group cannot be matched to different requirements.
 * @param {string} fileId
 * @param {string} targetRequirementId
 * @param {Record<string, string|null>} currentMatches
 * @param {Array<object>} files
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canMatchFile(fileId, targetRequirementId, currentMatches = {}, files = []) {
  if (!fileId) return { allowed: true };

  const targetFile = files.find(f => f.fileId === fileId);
  if (!targetFile) {
    return { allowed: false, reason: 'File not found.' };
  }

  if (targetFile.isDuplicate && targetFile.contentHash) {
    // Look for any sibling file in the same duplicate group
    for (const [rId, matchedFId] of Object.entries(currentMatches)) {
      if (rId !== targetRequirementId && matchedFId && matchedFId !== fileId) {
        const sibling = files.find(f => f.fileId === matchedFId);
        if (sibling && sibling.contentHash === targetFile.contentHash) {
          return {
            allowed: false,
            reason: `This file is a duplicate of "${sibling.name}", which is already matched to another requirement.`
          };
        }
      }
    }
  }

  return { allowed: true };
}

/**
 * Get names of other files sharing the same contentHash.
 * @param {string} fileId
 * @param {Array<object>} files
 * @returns {Array<string>} Names of sibling duplicate files
 */
export function getDuplicateSiblingNames(fileId, files = []) {
  const target = files.find(f => f.fileId === fileId);
  if (!target || !target.contentHash) return [];

  return files
    .filter(f => f.fileId !== fileId && f.contentHash === target.contentHash)
    .map(f => f.name);
}
