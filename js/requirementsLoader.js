/**
 * Requirements Loader Module (Phase 2 Implementation)
 * Loads, parses, validates, and sorts requirements.json specifications.
 */

import { setTenderAndRequirements } from './state.js';

/**
 * Parse and validate raw JSON string of requirements.
 * Enforces structure and sorts requirements by order ascending.
 * @param {string} jsonString
 * @returns {{ tender: object, requirements: Array<object> }}
 * @throws {Error} If structure is invalid or required fields are missing
 */
export function parseRequirements(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    throw new Error('Invalid JSON format: Could not parse requirements.json');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid requirements file: Root must be an object');
  }

  // Validate tender object
  const { tender } = data;
  if (!tender || typeof tender !== 'object') {
    throw new Error('Invalid requirements file: Missing "tender" section');
  }

  const requiredTenderFields = [
    'tender_id',
    'title',
    'procuring_entity',
    'bidder',
    'submission_deadline'
  ];

  for (const field of requiredTenderFields) {
    if (!tender[field] || typeof tender[field] !== 'string' || !tender[field].trim()) {
      throw new Error(`Invalid tender metadata: Missing or empty "${field}"`);
    }
  }

  // Validate requirements array
  const { requirements } = data;
  if (!Array.isArray(requirements) || requirements.length === 0) {
    throw new Error('Invalid requirements file: "requirements" must be a non-empty array');
  }

  const seenIds = new Set();
  const validatedRequirements = requirements.map((req, index) => {
    if (!req || typeof req !== 'object') {
      throw new Error(`Invalid requirement at index ${index}: Must be an object`);
    }

    if (!req.id || typeof req.id !== 'string') {
      throw new Error(`Invalid requirement at index ${index}: Missing "id"`);
    }

    if (seenIds.has(req.id)) {
      throw new Error(`Duplicate requirement id "${req.id}" found in requirements list`);
    }
    seenIds.add(req.id);

    if (typeof req.order !== 'number' || isNaN(req.order)) {
      throw new Error(`Invalid requirement "${req.id}": "order" must be a number`);
    }

    if (!req.title_en || typeof req.title_en !== 'string') {
      throw new Error(`Invalid requirement "${req.id}": Missing "title_en"`);
    }

    if (req.mandatory === undefined || typeof req.mandatory !== 'boolean') {
      throw new Error(`Invalid requirement "${req.id}": "mandatory" must be a boolean`);
    }

    if (req.has_expiry === undefined || typeof req.has_expiry !== 'boolean') {
      throw new Error(`Invalid requirement "${req.id}": "has_expiry" must be a boolean`);
    }

    return {
      id: req.id,
      order: req.order,
      title_en: req.title_en,
      title_bn: req.title_bn || req.title_en,
      mandatory: Boolean(req.mandatory),
      has_expiry: Boolean(req.has_expiry)
    };
  });

  // Strict sorting by order ascending (1 = first)
  const sortedRequirements = [...validatedRequirements].sort((a, b) => a.order - b.order);

  return {
    tender: {
      tender_id: tender.tender_id.trim(),
      title: tender.title.trim(),
      procuring_entity: tender.procuring_entity.trim(),
      bidder: tender.bidder.trim(),
      submission_deadline: tender.submission_deadline.trim()
    },
    requirements: sortedRequirements
  };
}

/**
 * Load and validate a requirements.json file, then update state.
 * @param {File|Blob} file
 * @returns {Promise<{ tender: object, requirements: Array<object> }>}
 */
export async function loadRequirements(file) {
  if (!file) {
    throw new Error('No file provided to loadRequirements');
  }

  let text;
  if (typeof file.text === 'function') {
    text = await file.text();
  } else {
    text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  const result = parseRequirements(text);
  setTenderAndRequirements(result.tender, result.requirements);
  return result;
}
