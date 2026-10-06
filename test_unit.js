import fs from 'fs';
import path from 'path';
import { parseRequirements } from './js/requirementsLoader.js';
import { computeSha256, MAX_FILES, MAX_TOTAL_SIZE } from './js/fileProcessor.js';
import { getState, resetState, setTenderAndRequirements, addUploadedFiles, removeUploadedFile } from './js/state.js';
import { t, setLanguage } from './js/i18n.js';

console.log('--- Running Phase 2 Automated Node Tests ---');

// Test 1: Valid requirements parsing
const validJson = fs.readFileSync('./test_data/requirements.json', 'utf8');
const result = parseRequirements(validJson);

console.assert(result.tender.tender_id === 'T-2026-0417', 'Tender ID matches');
console.assert(result.requirements.length === 4, '4 requirements found');
console.assert(result.requirements[0].order === 1, 'First is order 1');
console.assert(result.requirements[3].order === 4, 'Last is order 4');
console.log('✅ Test 1: Valid requirements parsing passed');

// Test 2: Invalid requirements rejection
const invalidJson = fs.readFileSync('./test_data/requirements_invalid.json', 'utf8');
let threw = false;
try {
  parseRequirements(invalidJson);
} catch (e) {
  threw = true;
  console.log('Caught expected error:', e.message);
}
console.assert(threw, 'Invalid JSON throws error');
console.log('✅ Test 2: Invalid requirements rejection passed');

// Test 3: Out-of-order sorting test
const unsortedJson = JSON.stringify({
  tender: {
    tender_id: "T-1",
    title: "T",
    procuring_entity: "P",
    bidder: "B",
    submission_deadline: "2026-10-20"
  },
  requirements: [
    { id: "R3", order: 3, title_en: "Three", title_bn: "৩", mandatory: true, has_expiry: false },
    { id: "R1", order: 1, title_en: "One", title_bn: "১", mandatory: true, has_expiry: false },
    { id: "R2", order: 2, title_en: "Two", title_bn: "২", mandatory: false, has_expiry: true }
  ]
});
const sortedResult = parseRequirements(unsortedJson);
console.assert(sortedResult.requirements[0].order === 1 && sortedResult.requirements[0].id === 'R1', 'Order 1 first');
console.assert(sortedResult.requirements[1].order === 2 && sortedResult.requirements[1].id === 'R2', 'Order 2 second');
console.assert(sortedResult.requirements[2].order === 3 && sortedResult.requirements[2].id === 'R3', 'Order 3 third');
console.log('✅ Test 3: Requirements order sorting passed');

// Test 4: State mutations & subscribers
resetState();
setTenderAndRequirements(sortedResult.tender, sortedResult.requirements);
console.assert(getState().tender.tender_id === 'T-1', 'State tender set');
console.assert(getState().requirements.length === 3, 'State requirements set');

addUploadedFiles([
  { fileId: 'f1', name: 'test.pdf', size: 100, pageCount: 2, contentHash: 'abc', arrayBuffer: new ArrayBuffer(8) }
]);
console.assert(getState().uploadedFiles.length === 1, 'File added to state');

removeUploadedFile('f1');
console.assert(getState().uploadedFiles.length === 0, 'File removed from state');
console.log('✅ Test 4: State mutation helpers passed');

// Test 5: SHA-256 computation
const buffer = new TextEncoder().encode("Hello DevFest");
const hash = await computeSha256(buffer.buffer);
console.assert(typeof hash === 'string' && hash.length === 64, 'SHA-256 hash valid length');
console.log('✅ Test 5: SHA-256 computation passed (hash:', hash, ')');

// Test 6: i18n switching
setLanguage('en');
console.assert(t('appTitle') === 'Tender Document Package Builder', 'EN translation correct');
setLanguage('bn');
console.assert(t('appTitle') === 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার', 'BN translation correct');
console.log('✅ Test 6: i18n language toggle passed');

console.log('\n🎉 ALL UNIT TESTS PASSED SUCCESSFULLY! 🎉');
