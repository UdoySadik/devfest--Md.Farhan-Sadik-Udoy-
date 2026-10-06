# IMPLEMENTATION_PLAN.md — Tender Document Package Builder

**Competition:** AI DevFest — Vibe Coding  
**Total Build Time:** 90 minutes  
**Phases:** 7 (5 mandatory core + 1 bonus + 1 QA)

---

## Time Budget Overview

| Phase | Name | Time | Cumulative | Priority |
|-------|------|------|-----------|----------|
| 1 | Foundation & Project Shell | ~10 min | 10 min | MANDATORY |
| 2 | Requirements Loading & File Upload | ~15 min | 25 min | MANDATORY |
| 3 | Matching, Expiry & Status Engine | ~15 min | 40 min | MANDATORY |
| 4 | Duplicate Detection & Package Generation | ~20 min | 60 min | MANDATORY |
| 5 | Bilingual UI & Polish | ~10 min | 70 min | MANDATORY |
| 6 | High-Value Bonus Features | ~10 min | 80 min | BONUS |
| 7 | Final QA & Deployment | ~10 min | 90 min | MANDATORY |

---

# Phase 1 — Foundation & Project Shell

## Objective
Create the complete project skeleton with all files, CDN dependencies, design system, central state management, and i18n infrastructure. After this phase, the app loads in Chrome, shows a styled shell with all layout sections, and all JavaScript modules exist as stubs.

## Scope
- `index.html` with semantic structure, CDN script tags (pdf.js, pdf-lib), and all section containers
- `css/styles.css` with complete design system (CSS variables, typography, colors, layout, component styles)
- `js/state.js` — central state object + `updateState()` + render trigger
- `js/i18n.js` — full EN/BN translation dictionaries + `t()` helper + `getDocTitle()` + language switcher logic
- `js/app.js` — initialization, event binding, render orchestration
- `js/ui/renderer.js` — main render function that calls component renderers
- All other JS module files created as stubs with exported function signatures
- Language switcher in the UI header (functional)
- Empty placeholder sections for: tender info, requirements list, file upload, matching, generate/download

## Dependencies
None — this is the first phase.

## Files / Modules

| File | Action |
|------|--------|
| `index.html` | Create |
| `css/styles.css` | Create |
| `js/app.js` | Create |
| `js/state.js` | Create |
| `js/i18n.js` | Create |
| `js/requirementsLoader.js` | Create (stub) |
| `js/fileProcessor.js` | Create (stub) |
| `js/duplicateDetector.js` | Create (stub) |
| `js/matcher.js` | Create (stub) |
| `js/statusEngine.js` | Create (stub) |
| `js/packageGenerator.js` | Create (stub) |
| `js/ui/renderer.js` | Create |
| `js/ui/tenderInfo.js` | Create (stub) |
| `js/ui/requirementsList.js` | Create (stub) |
| `js/ui/fileUpload.js` | Create (stub) |
| `js/ui/matchingUI.js` | Create (stub) |
| `js/ui/notifications.js` | Create (stub) |

## Features
- Complete visual shell with premium dark-mode design
- CSS design system (variables, colors, typography, spacing, component tokens)
- Central state management (`state.js`)
- Complete i18n system with EN/BN dictionaries
- Language switcher (toggles between EN and BN, re-renders UI)
- App initialization flow
- All module stubs created for later phases

## DOES NOT INCLUDE
- Requirements JSON loading or parsing
- File upload functionality
- PDF processing of any kind
- Matching logic
- Status calculation
- Duplicate detection
- Package generation
- Download functionality

## Implementation Steps
1. Create `index.html` with HTML5 structure, meta tags, CDN links for pdf.js and pdf-lib, section containers
2. Create `css/styles.css` with full design system: CSS variables, dark theme, glassmorphism effects, typography (Google Fonts), component styles, animations, responsive layout
3. Create `js/state.js` with AppState object, `updateState()`, subscriber pattern for re-rendering
4. Create `js/i18n.js` with complete EN and BN translation dictionaries (all UI strings, statuses, errors, labels)
5. Create `js/app.js` with initialization, event wiring, language switcher handler
6. Create `js/ui/renderer.js` with `renderAll()` that calls each component renderer
7. Create all stub modules with exported function signatures (empty implementations)
8. Test that the app opens in Chrome, shows styled layout, and language toggle works

## Testing
- Open `index.html` in Chrome → styled shell appears
- Click language switcher → UI labels change between EN and BN
- No console errors
- All section containers are visible with placeholder content

## Acceptance Criteria
- [x] App loads in Chrome without errors
- [x] Premium dark-mode design is visible
- [x] Language switcher toggles EN↔BN successfully
- [x] All UI section containers are present and styled
- [x] All JS modules exist (stubs with correct exports)
- [x] CDN libraries load successfully (pdf.js and pdf-lib available in console)

## Expected Output
- Working `index.html` with styled UI shell
- Complete CSS design system
- Functional state management
- Functional i18n with language switching
- All module files exist as stubs

## DEPENDENCIES
None

## PRODUCES
- Complete project file structure for all later phases
- Functional state management system (used by Phases 2-6)
- Functional i18n system (used by all phases for translations)
- CSS design system and component styles (used by all UI phases)
- HTML section containers (DOM targets for all UI phases)

---

## Phase 1 — Implementation Prompt

```
You are implementing Phase 1 of the Tender Document Package Builder.

Follow ARCHITECTURE.md and IMPLEMENTATION_PLAN.md strictly.

IMPLEMENT ONLY PHASE 1 — Foundation & Project Shell.

Create the complete project skeleton:
1. index.html — full HTML5 structure with CDN links for pdf.js (3.11.174) and pdf-lib (1.17.1), all section containers, Google Fonts (Inter), meta tags
2. css/styles.css — complete design system with CSS variables, premium dark-mode theme with glassmorphism, typography, all component styles, micro-animations, responsive layout
3. js/state.js — central AppState object with updateState(), subscriber pattern
4. js/i18n.js — complete EN and BN translation dictionaries with t() helper, getDocTitle(), setLanguage()
5. js/app.js — initialization, event wiring, language switcher
6. js/ui/renderer.js — renderAll() orchestrator
7. All other JS module stubs (requirementsLoader, fileProcessor, duplicateDetector, matcher, statusEngine, packageGenerator, ui/tenderInfo, ui/requirementsList, ui/fileUpload, ui/matchingUI, ui/notifications) — export correct function signatures, empty implementations

The design must be PREMIUM and VISUALLY STUNNING. Use dark mode, glassmorphism, gradients, smooth animations. The language switcher must work and toggle all visible UI text.

DO NOT implement: requirements loading, file upload, PDF processing, matching, status engine, duplicate detection, package generation, or download.

Test that the app loads in Chrome without errors and the language switcher works.
Do NOT run git commit or git push.
```

---

# Phase 2 — Requirements Loading & File Upload

## Objective
Implement the requirements.json loading (Task 4.1) and multi-file PDF upload with validation and page counting (Task 4.2). After this phase, the user can load a requirements.json and upload PDFs, seeing tender info, sorted document list, and uploaded file details.

## Scope
- `js/requirementsLoader.js` — full implementation: parse JSON, validate structure, sort requirements by order
- `js/fileProcessor.js` — full implementation: read ArrayBuffer, validate PDF (MIME + pdf.js), count pages, compute SHA-256 hash, enforce limits (30 files / 50 MB)
- `js/ui/tenderInfo.js` — render tender details panel (ID, title, entity, bidder, deadline)
- `js/ui/requirementsList.js` — render sorted requirements table (order, title, mandatory/optional badge, status placeholder)
- `js/ui/fileUpload.js` — render drag-and-drop upload zone, file list with name/pages/size, remove button, error messages
- `js/ui/notifications.js` — toast/notification system for errors and info messages
- Wire up file input and JSON input to their handlers
- Update `js/app.js` and `js/ui/renderer.js` to incorporate new components

## Dependencies

| Dependency | From Phase |
|------------|-----------|
| Project file structure | Phase 1 |
| `state.js` (state management) | Phase 1 |
| `i18n.js` (translations) | Phase 1 |
| `css/styles.css` (design system) | Phase 1 |
| `index.html` (DOM containers) | Phase 1 |

## Files / Modules

| File | Action |
|------|--------|
| `js/requirementsLoader.js` | Implement |
| `js/fileProcessor.js` | Implement |
| `js/ui/tenderInfo.js` | Implement |
| `js/ui/requirementsList.js` | Implement |
| `js/ui/fileUpload.js` | Implement |
| `js/ui/notifications.js` | Implement |
| `js/app.js` | Update (add event handlers) |
| `js/ui/renderer.js` | Update (call new components) |
| `js/state.js` | Update (add state mutation helpers for requirements + files) |

## Features
- **M1:** Load `requirements.json` → display tender info + sorted document list
- **M2:** Upload multiple PDFs → show filename, page count, file size; reject non-PDFs with message; remove files
- JSON structure validation with clear error on malformed data
- File limit enforcement (max 30 files, max 50 MB total)
- PDF validity check via pdf.js (reject corrupt files)
- SHA-256 content hashing (computed and stored, but duplicate detection logic is Phase 4)
- Notification/toast system for errors

## DOES NOT INCLUDE
- File-to-requirement matching (Phase 3)
- Expiry date entry (Phase 3)
- Status calculation beyond placeholder (Phase 3)
- Duplicate detection logic or duplicate UI badges (Phase 4)
- Package generation (Phase 4)
- Download (Phase 4)

## Implementation Steps
1. Implement `requirementsLoader.js`:
   - Accept File object, read as text, parse JSON
   - Validate `tender` object has: tender_id, title, procuring_entity, bidder, submission_deadline
   - Validate `requirements` array: each item has id, order, title_en, title_bn, mandatory, has_expiry
   - Sort requirements by `order` ascending
   - Update state with tender + requirements
2. Implement `fileProcessor.js`:
   - `processFiles(fileList)` → for each file:
     - Check MIME type / extension for PDF
     - Check file count limit (30) and total size limit (50 MB)
     - Read as ArrayBuffer
     - Validate with pdf.js (getDocument → numPages)
     - Compute SHA-256 hash via crypto.subtle.digest
     - Create UploadedFile object with fileId (crypto.randomUUID), name, size, pageCount, contentHash, arrayBuffer
   - `removeFile(fileId)` → remove from state
3. Implement `js/ui/tenderInfo.js` — render tender details card
4. Implement `js/ui/requirementsList.js` — render sorted requirements table with columns: #, Order, Document Name (i18n), Mandatory/Optional, Status (placeholder for now)
5. Implement `js/ui/fileUpload.js` — drag-and-drop zone + file input + uploaded file list with remove buttons
6. Implement `js/ui/notifications.js` — toast notification system
7. Wire up event handlers in `app.js`: JSON file input, PDF file input, file remove buttons
8. Update `renderer.js` to call all new component renderers

## Testing
- Load a valid `requirements.json` → tender info panel shows all fields
- Load with missing fields → error notification shown
- Upload a valid PDF → file appears in list with page count
- Upload a non-PDF → error message, file not added
- Upload multiple PDFs at once → all appear with correct page counts
- Remove a file → file disappears from list
- Try uploading > 30 files → error message
- Verify requirements are sorted by `order`
- Switch language → document titles switch between EN/BN

## Acceptance Criteria
- [x] `requirements.json` loads and displays tender info correctly
- [x] Requirements listed in correct order with all fields
- [x] Multi-file PDF upload works
- [x] Each file shows name and page count
- [x] Non-PDF files are rejected with clear message
- [x] File removal works
- [x] File limits enforced (30 files, 50 MB)
- [x] SHA-256 hashes are computed and stored (for later use)
- [x] Language switch updates document titles

## Expected Output
- Functional requirements loading with tender info display
- Functional file upload with validation and page counting
- Toast notification system

## DEPENDENCIES
Phase 1 (state, i18n, CSS, HTML, renderer)

## PRODUCES
- Loaded tender data and requirements in state (used by Phases 3, 4, 5)
- Uploaded files with page counts and content hashes in state (used by Phases 3, 4)
- Notification system (used by all subsequent phases)
- Requirements list UI (extended in Phase 3 with status badges)
- File list UI (extended in Phase 4 with duplicate badges)

---

## Phase 2 — Implementation Prompt

```
You are implementing Phase 2 of the Tender Document Package Builder.

Follow ARCHITECTURE.md and IMPLEMENTATION_PLAN.md strictly.

IMPLEMENT ONLY PHASE 2 — Requirements Loading & File Upload.

Phase 1 is already complete (state.js, i18n.js, app.js, renderer.js, styles.css, index.html, all stubs).

Implement:
1. js/requirementsLoader.js — parse and validate requirements.json, sort by order, update state
2. js/fileProcessor.js — read files, validate PDF type, validate with pdf.js for page count, compute SHA-256 hash, enforce limits (30 files / 50 MB), create UploadedFile objects
3. js/ui/tenderInfo.js — render tender details (ID, title, entity, bidder, deadline)
4. js/ui/requirementsList.js — render sorted requirements table (order, name with i18n, mandatory/optional badge, status placeholder)
5. js/ui/fileUpload.js — drag-and-drop upload zone + file list (name, pages, size, remove button)
6. js/ui/notifications.js — toast notification system for errors/success
7. Update app.js with event handlers for JSON input and PDF upload
8. Update renderer.js to call new component renderers

DO NOT implement: matching, expiry dates, status engine, duplicate detection logic, package generation, or download.

SHA-256 hashes should be computed and stored on each uploaded file for later use.

Test with a sample requirements.json and PDF files.
Do NOT run git commit or git push.
```

---

# Phase 3 — Matching, Expiry & Status Engine

## Objective
Implement file-to-requirement matching (Task 4.3), expiry date entry (Task 4.4), and the complete status engine (Task 4.5). After this phase, users can match files to requirements, enter expiry dates, and see real-time status updates. The Generate button appears (disabled if blocking statuses exist) with explanations.

## Scope
- `js/matcher.js` — full implementation: match file to requirement, undo match, enforce one-to-one constraint, check duplicate constraint
- `js/statusEngine.js` — full implementation: `computeStatus()` for each requirement, `computeAllStatuses()`, `getBlockingStatuses()`, exact decision logic from ARCHITECTURE.md Section 12
- `js/ui/matchingUI.js` — dropdown/select UI for each requirement to pick a file; undo button; show current match
- `js/ui/requirementsList.js` — update to show: status badges (color-coded), expiry date input (when applicable), matched file name
- Generate button UI (disabled state + blocking reason list) — but NOT the generation logic
- Real-time status recalculation on every state change

## Dependencies

| Dependency | From Phase |
|------------|-----------|
| State management | Phase 1 |
| i18n system | Phase 1 |
| Requirements in state | Phase 2 |
| Uploaded files in state (with contentHash) | Phase 2 |
| Requirements list UI | Phase 2 |
| Notification system | Phase 2 |

## Files / Modules

| File | Action |
|------|--------|
| `js/matcher.js` | Implement |
| `js/statusEngine.js` | Implement |
| `js/ui/matchingUI.js` | Implement |
| `js/ui/requirementsList.js` | Update (add status badges, expiry input, match info) |
| `js/state.js` | Update (add match/expiry state mutation helpers) |
| `js/ui/renderer.js` | Update (integrate matching UI, status recalculation) |
| `js/app.js` | Update (add match/expiry event handlers, wire status recalculation) |

## Features
- **M3:** One-to-one file-to-requirement matching with change/undo
- **M4:** Expiry date entry for `has_expiry = true` requirements (date picker, shown only when file is matched)
- **M5:** Real-time status calculation with exact rules:
  - Missing: mandatory, no file matched (blocking)
  - Expiry date needed: has_expiry=true, file matched, no date (blocking)
  - Expired: expiry date < submission_deadline (blocking)
  - Not provided: optional, no file matched (non-blocking)
  - OK: file matched, and expiry valid or not needed (non-blocking)
  - Same-day edge case: expiry == deadline → OK
- **M7 (partial):** Generate button disabled state + blocking reasons display (generation logic in Phase 4)
- Date comparison via string comparison (YYYY-MM-DD lexicographic)

## DOES NOT INCLUDE
- Duplicate detection logic or UI (Phase 4) — the matcher will check duplicate constraints using the duplicate data, but the detection itself is Phase 4
- Package generation (Phase 4)
- Download functionality (Phase 4)
- Bilingual polish (Phase 5)

## Implementation Steps
1. Implement `js/statusEngine.js`:
   - `computeStatus(requirement, matchedFileId, expiryDate, submissionDeadline)` — exact logic from Architecture Section 12.3
   - `computeAllStatuses(requirements, matches, expiryDates, submissionDeadline)` — returns status map
   - `getBlockingStatuses(statuses, requirements)` — returns array of blocking items
   - `isBlocking(status)` — helper
2. Implement `js/matcher.js`:
   - `matchFileToRequirement(fileId, requirementId)` — enforce one-to-one, check if file already matched elsewhere, check duplicate group constraint
   - `unmatchRequirement(requirementId)` — clear match and expiry date
   - `getAvailableFilesForRequirement(requirementId)` — files not matched elsewhere (respecting duplicate constraint)
   - `getAvailableRequirementsForFile(fileId)` — requirements not matched to other files
3. Implement `js/ui/matchingUI.js`:
   - For each requirement row: dropdown of available files (or "-- Select --")
   - Undo/clear match button when matched
   - Expiry date input (type="date") shown only when requirement.has_expiry && file is matched
4. Update `js/ui/requirementsList.js`:
   - Add status badge column with color coding (red=blocking, green=OK, gray=not provided)
   - Add matched file name column
   - Integrate expiry date input
   - Show blocking reasons summary near Generate button
5. Wire status recalculation in state update flow: every time matches/expiryDates/files change → recompute all statuses → re-render
6. Add Generate button (disabled state) with blocking reasons list displayed when disabled

## Testing
- Match a file to a mandatory requirement → status changes from "Missing" to "OK" (or "Expiry date needed")
- Unmatch → status returns to "Missing"
- Match file to `has_expiry=true` requirement, no date → "Expiry date needed"
- Enter expiry date before deadline → "Expired"
- Enter expiry date = deadline → "OK" (same-day rule!)
- Enter expiry date after deadline → "OK"
- Optional requirement with no match → "Not provided"
- Try matching a file that's already matched → prevented or previous match cleared
- All mandatory requirements matched with valid expiry → Generate button becomes enabled
- Any blocking status → Generate button disabled with reason shown

## Acceptance Criteria
- [x] File-to-requirement matching works with dropdowns
- [x] One-to-one constraint enforced
- [x] Match can be changed or undone
- [x] Expiry date input appears for `has_expiry = true` requirements when matched
- [x] All 5 status types display correctly
- [x] Same-day expiry = deadline is treated as OK
- [x] Statuses update in real-time after every change
- [x] Generate button disabled when blocking statuses exist
- [x] Blocking reasons are displayed to the user

## Expected Output
- Functional matching system
- Functional status engine with all rules
- Expiry date handling
- Generate button with disabled state + reasons

## DEPENDENCIES
Phase 1 (state, i18n, CSS), Phase 2 (requirements, files, notifications)

## PRODUCES
- Complete matching state (used by Phase 4 for package generation)
- Complete status engine (used by Phase 4 to gate generation)
- Expiry date state (used by Phase 4 for cover page)
- Matcher with duplicate constraint checking (ready for Phase 4 duplicate detection)

---

## Phase 3 — Implementation Prompt

```
You are implementing Phase 3 of the Tender Document Package Builder.

Follow ARCHITECTURE.md and IMPLEMENTATION_PLAN.md strictly.

IMPLEMENT ONLY PHASE 3 — Matching, Expiry & Status Engine.

Phases 1-2 are complete. Requirements loading, file upload with page counting, and SHA-256 hashing all work.

Implement:
1. js/statusEngine.js — computeStatus() with EXACT rules from ARCHITECTURE.md Section 12.3:
   - Missing (mandatory, no match) → blocking
   - Expiry date needed (has_expiry, matched, no date) → blocking
   - Expired (expiry < deadline, using string comparison) → blocking
   - Not provided (optional, no match) → non-blocking
   - OK (matched, expiry valid or not needed) → non-blocking
   - CRITICAL: expiry == deadline → OK (same-day rule)
2. js/matcher.js — matchFileToRequirement(), unmatchRequirement(), getAvailableFiles/Requirements, enforce one-to-one, check duplicate group constraint
3. js/ui/matchingUI.js — dropdown for each requirement to select a file, undo button, expiry date input (type="date") shown when has_expiry + matched
4. Update requirementsList.js — add status badges (color-coded), matched file info, expiry inputs
5. Add Generate button (disabled when blocking statuses exist) with blocking reasons list
6. Wire real-time status recalculation on every state change (match/unmatch/expiry change)

Use YYYY-MM-DD string comparison for dates — no Date object parsing needed for comparison.

DO NOT implement: duplicate detection logic, package generation, download functionality.

Test all status transitions including the same-day expiry edge case.
Do NOT run git commit or git push.
```

---

# Phase 4 — Duplicate Detection & Package Generation

## Objective
Implement exact-content duplicate detection (Task 4.6) and the complete PDF package generation pipeline (Tasks 4.7, 4.8) including cover page, document merging, footer stamping, and download. This is the most complex phase. After this phase, the complete mandatory workflow is functional.

## Scope
- `js/duplicateDetector.js` — full implementation: group files by contentHash, mark duplicates, recalculate on add/remove
- `js/packageGenerator.js` — full implementation: cover page, document appending, footer stamping, download
- Update file list UI to show duplicate badges
- Update matcher to enforce duplicate constraints in UI
- Wire Generate button to package generation
- Download as `<tender_id>_Package.pdf`

## Dependencies

| Dependency | From Phase |
|------------|-----------|
| State management | Phase 1 |
| i18n system | Phase 1 |
| Uploaded files with contentHash | Phase 2 |
| Requirements in state | Phase 2 |
| Matching state | Phase 3 |
| Status engine | Phase 3 |
| Blocking status aggregation | Phase 3 |

## Files / Modules

| File | Action |
|------|--------|
| `js/duplicateDetector.js` | Implement |
| `js/packageGenerator.js` | Implement |
| `js/ui/fileUpload.js` | Update (add duplicate badges) |
| `js/matcher.js` | Update (enforce duplicate matching constraint in UI) |
| `js/app.js` | Update (wire Generate button, integrate duplicate detection) |
| `js/state.js` | Update (integrate duplicate detection in update flow) |
| `js/ui/renderer.js` | Update (integrate duplicate detection in render cycle) |

## Features
- **M6:** Exact-content duplicate detection:
  - SHA-256 hash grouping (hashes already computed in Phase 2)
  - Files with same hash marked as duplicates with visual badge
  - Duplicate files blocked from being matched to different requirements
  - Recalculation on file add/remove
- **M7:** Package generation:
  - Cover page (English only): tender ID, title, procuring entity, bidder, deadline, generation date, document list
  - Documents appended in `order` sequence, all pages in original order
  - Optional documents with no match skipped
  - Footer on every page: `<tender_id> | Page X of Y`
  - Footer readable, not covering content (bottom margin)
  - Total page count known before footer stamping
- **M8:** Download as `<tender_id>_Package.pdf`

## DOES NOT INCLUDE
- Bilingual polish / final translations (Phase 5)
- Index page bonus (Phase 6)
- Seal/signature bonus (Phase 6)
- CSV export bonus (Phase 6)
- Any other bonus features (Phase 6)

## Implementation Steps
1. Implement `js/duplicateDetector.js`:
   - `detectDuplicates(uploadedFiles)` → returns updated files with isDuplicate and duplicateGroupId flags
   - Groups files by contentHash; groups with 2+ files are duplicate groups
   - Single-file groups → isDuplicate = false
   - Call after every file add/remove
2. Integrate duplicate detection into state update flow:
   - After files change → run detectDuplicates → update file flags → re-render
3. Update `js/ui/fileUpload.js` to show "⚠ Duplicate" badge on duplicate files with tooltip showing duplicate sibling names
4. Update `js/matcher.js` to enforce: if file F is in a duplicate group and another file in the group is matched to a different requirement, block the match with clear error message
5. Implement `js/packageGenerator.js`:
   a. `generatePackage(state)` — main function:
   b. Determine included documents: requirements with matched files, sorted by order
   c. Pre-calculate total pages: 1 (cover) + sum of matched file pageCounts
   d. Create new PDFDocument via pdf-lib
   e. Generate cover page:
      - Add blank page (A4 size: 595.28 x 841.89 points)
      - Embed Helvetica font
      - Draw: "Tender Document Package" title
      - Draw: Tender ID, Title, Procuring Entity, Bidder, Submission Deadline, Generation Date
      - Draw: "Included Documents:" + numbered list of document titles (title_en)
   f. For each included document (in order):
      - Load the matched file's ArrayBuffer as PDFDocument
      - Copy all pages to the new document
   g. Stamp footers on every page:
      - Format: `<tender_id> | Page X of Y`
      - Position: bottom center, y=20, size=10, gray color
      - Measure text width for proper centering
   h. Serialize to bytes → create Blob
6. Implement download:
   - Create object URL from Blob
   - Create temporary `<a>` element with download=`${tender_id}_Package.pdf`
   - Trigger click → revoke URL
7. Wire Generate button: onClick → if no blocking statuses → show progress → call generatePackage → trigger download
8. Add progress indicator during generation

## Testing
- Upload two identical files with different names → both show duplicate badge
- Try matching both duplicates to different requirements → second match blocked with message
- Remove one duplicate → remaining file loses duplicate badge
- Match all mandatory requirements, enter valid expiry dates → Generate button enables
- Click Generate → PDF downloads with correct filename
- Open downloaded PDF:
  - Page 1 is cover with all tender info + document list
  - Documents follow in correct order
  - Every page has footer: `<tender_id> | Page X of Y`
  - Y = correct total page count
  - Footer is readable and not covering content
  - All pages from each file are included in original order
  - Optional unmatched documents are skipped

## Acceptance Criteria
- [x] Duplicate files detected and visually marked
- [x] Duplicate matching constraint enforced
- [x] Duplicate badges appear/disappear correctly on add/remove
- [x] Generate button works when no blocking statuses
- [x] Cover page shows all required information in English
- [x] Documents ordered correctly by `order` field
- [x] All pages preserved in original order
- [x] Footer `<tender_id> | Page X of Y` on every page
- [x] Footer readable, not covering content
- [x] Total page count (Y) is correct
- [x] Download filename is `<tender_id>_Package.pdf`
- [x] Optional unmatched documents skipped

## Expected Output
- Functional duplicate detection with UI
- Complete PDF package generation
- Working download

## DEPENDENCIES
Phase 1 (state, i18n, CSS), Phase 2 (files with hashes, requirements), Phase 3 (matching, status engine)

## PRODUCES
- Complete mandatory workflow (all M1-M8 features functional)
- Generated package output for submission

---

## Phase 4 — Implementation Prompt

```
You are implementing Phase 4 of the Tender Document Package Builder.

Follow ARCHITECTURE.md and IMPLEMENTATION_PLAN.md strictly.

IMPLEMENT ONLY PHASE 4 — Duplicate Detection & Package Generation.

Phases 1-3 are complete. Requirements load, files upload with SHA-256 hashes, matching works, status engine calculates all statuses correctly.

Implement:
1. js/duplicateDetector.js — detectDuplicates(files): group by contentHash, mark files with isDuplicate/duplicateGroupId, recalculate on add/remove
2. Update js/ui/fileUpload.js — show "⚠ Duplicate" badge on duplicate files
3. Update js/matcher.js — block matching duplicate files to different requirements with clear error
4. js/packageGenerator.js — complete PDF generation pipeline using pdf-lib:
   a. Determine included docs (matched requirements sorted by order)
   b. Pre-calculate total pages: 1 (cover) + sum of file pageCounts
   c. Create PDFDocument, add cover page (A4, English only) with: Tender ID, Title, Procuring Entity, Bidder, Deadline, Generation Date, Document List
   d. Copy all pages from each matched file in order
   e. Stamp footer on EVERY page: "<tender_id> | Page X of Y", bottom center, y=20, size=10
   f. Use font.widthOfTextAtSize() for proper centering
   g. Save → Blob → download as <tender_id>_Package.pdf
5. Wire Generate button to packageGenerator
6. Add progress indicator during generation

CRITICAL RULES for package:
- Cover page is ALWAYS English (use title_en)
- Documents sorted by order field
- ALL pages of each file preserved in original order
- Optional unmatched documents SKIPPED
- Footer on EVERY page including cover
- Y in "Page X of Y" = total pages in final PDF
- Download filename = <tender_id>_Package.pdf

Test with sample pack. Verify duplicate detection and package output.
Do NOT run git commit or git push.
```

---

# Phase 5 — Bilingual UI & Polish

## Objective
Complete the bilingual experience (Task 4.9), polish all UI interactions, ensure robust error handling, and verify the complete mandatory workflow works end-to-end.

## Scope
- Complete BN translation dictionary with all missing strings
- Ensure every UI element respects language setting
- Polish visual design: transitions, hover states, loading states, empty states
- Error handling robustness: all try/catch blocks, graceful failures
- End-to-end workflow validation
- Accessibility improvements (ARIA labels, keyboard navigation)

## Dependencies

| Dependency | From Phase |
|------------|-----------|
| All core features | Phases 1-4 |
| i18n system | Phase 1 |

## Files / Modules

| File | Action |
|------|--------|
| `js/i18n.js` | Update (complete BN dictionary, add any missing strings) |
| `css/styles.css` | Update (polish, transitions, responsive refinements) |
| `js/ui/*.js` | Update (ensure all text uses t() / getDocTitle()) |
| `js/app.js` | Update (add global error handler) |
| `js/fileProcessor.js` | Update (add try/catch for edge cases) |

## Features
- **M9:** Complete bilingual UI:
  - All labels, buttons, headings, status names, error messages translated
  - Document names switch between `title_en` and `title_bn`
  - Date formats appropriate for each language
  - Cover page remains English regardless of UI language
- Error handling polish:
  - Global `window.onerror` / `unhandledrejection` handler
  - All async operations wrapped in try/catch
  - User-friendly error messages in both languages
- Visual polish:
  - Smooth transitions on all state changes
  - Loading spinners during file processing
  - Empty state messages when no requirements/files loaded
  - Responsive design verification

## DOES NOT INCLUDE
- Bonus features (Phase 6)
- Any new functionality — this phase is polish only

## Implementation Steps
1. Audit every UI component for untranslated strings → add to i18n.js
2. Complete the BN dictionary with all strings (statuses, labels, errors, placeholders, tooltips)
3. Verify language switch updates every visible text element
4. Add global error handler in app.js
5. Review all async operations for missing try/catch
6. Add smooth CSS transitions for status changes, file additions, button state changes
7. Add empty state messages ("No requirements loaded", "No files uploaded")
8. Add loading indicators for file processing
9. Test responsive layout at different widths
10. Full end-to-end test: load → upload → match → expiry → generate → download → switch language → verify

## Testing
- Switch to BN → every UI element shows Bangla text
- Switch back to EN → everything reverts to English
- Document names use title_bn in BN mode, title_en in EN mode
- Generate PDF while in BN mode → cover page is still in English
- Corrupt JSON file → graceful error message in current language
- Browser resize → layout adjusts properly
- Full workflow in both languages

## Acceptance Criteria
- [x] All UI text translated to both EN and BN
- [x] Language switch updates every visible element
- [x] Cover page always English regardless of UI language
- [x] Error messages appear in the current language
- [x] No uncaught errors in console during normal workflow
- [x] Visual transitions are smooth
- [x] Empty states have appropriate messages
- [x] Responsive layout works at common widths

## Expected Output
- Fully bilingual application
- Polished, robust user experience
- All mandatory requirements (M1-M9) complete

## DEPENDENCIES
Phases 1-4 (all core features)

## PRODUCES
- Complete mandatory feature set (ready for judging)
- Robust error handling (supports Phase 6 bonus features)

---

## Phase 5 — Implementation Prompt

```
You are implementing Phase 5 of the Tender Document Package Builder.

Follow ARCHITECTURE.md and IMPLEMENTATION_PLAN.md strictly.

IMPLEMENT ONLY PHASE 5 — Bilingual UI & Polish.

Phases 1-4 are complete. All core features work: requirements loading, file upload, matching, status engine, duplicate detection, package generation, download.

Your task is POLISH ONLY:
1. Complete the BN (Bangla) translation dictionary in i18n.js — every UI string must have a BN equivalent
2. Audit ALL UI components — ensure every visible text element uses t() or getDocTitle()
3. Verify language switch updates ALL visible text
4. Cover page must remain English even when UI is in BN mode
5. Add global error handler (window.onerror, unhandledrejection)
6. Add try/catch around all async operations
7. Add CSS transitions for state changes, hover effects, loading states
8. Add empty state messages ("No requirements loaded", "No files uploaded")
9. Test responsive layout
10. Full end-to-end test in both languages

DO NOT add new features or bonus functionality.

Test thoroughly: switch language mid-workflow, generate in BN mode, verify cover page stays English.
Do NOT run git commit or git push.
```

---

# Phase 6 — High-Value Bonus Features

## Objective
Add high-value bonus features that maximize scoring. Only attempt this phase if all mandatory features (M1-M9) are complete and working. Select bonus features based on remaining time.

## Scope (in priority order)

1. **B7 — Safe bad file handling:** Graceful handling of damaged/password-protected PDFs (quick win, defensive)
2. **B6 — Auto-match:** Suggest file-to-requirement matches based on filename similarity (high judge appeal)
3. **B3 — CSV export:** Export checklist as CSV (document, filename, pages, expiry, status)
4. **B1 — Index page:** Add index page after cover showing page numbers where each document starts

## Dependencies

| Dependency | From Phase |
|------------|-----------|
| All mandatory features | Phases 1-5 |

## Files / Modules

| File | Action |
|------|--------|
| `js/fileProcessor.js` | Update (B7: enhanced error handling for bad PDFs) |
| `js/matcher.js` | Update (B6: add suggestMatches() function) |
| `js/ui/matchingUI.js` | Update (B6: add auto-match button/suggestions) |
| `js/exporter.js` | Create (B3: CSV export) |
| `js/packageGenerator.js` | Update (B1: add index page) |
| `js/app.js` | Update (wire bonus feature UI) |

## Features
- **B7:** Damaged/password-protected PDFs show clear error message instead of crashing
- **B6:** Auto-match button suggests matches using filename-to-title similarity
- **B3:** Export button generates CSV with columns: Document, File Name, Pages, Expiry Date, Status
- **B1:** Index page after cover showing: Document Name → Page Number

## DOES NOT INCLUDE
- Seal/signature (B2) — complex, low ROI for time
- Save/reopen (B4) — complex state serialization
- Bangla PDF text (B5) — requires font embedding
- AI help (B8) — requires API key handling

## Implementation Steps
1. **B7 (5 min):** Update `fileProcessor.js` to catch specific pdf.js errors (PasswordException, InvalidPDFException) and show targeted error messages instead of generic failures
2. **B6 (5 min):** Add `suggestMatches()` to `matcher.js`:
   - For each unmatched file, compare filename (lowercase, no extension) against requirement titles (lowercase)
   - Use simple substring/includes matching
   - Return suggested matches; let user confirm
   - Add "Auto-match" button to UI
3. **B3 (5 min):** Create `exporter.js`:
   - Build CSV string from state: requirement title, matched filename, page count, expiry date, status
   - Create Blob → download as `<tender_id>_Checklist.csv`
   - Add "Export CSV" button to UI
4. **B1 (5 min if time remains):** Update `packageGenerator.js`:
   - After cover page, add index page
   - List each included document with its starting page number
   - Starting page = 1 (cover) + 1 (index) + sum of previous document pages
   - Update total page count (Y) to include index page

## Testing
- Upload a damaged PDF → clear error, app doesn't crash
- Click Auto-match → reasonable suggestions appear
- Click Export CSV → CSV downloads with correct data
- Generate with index page → index shows correct page numbers

## Acceptance Criteria
- [x] Bad PDFs handled gracefully (no crash)
- [x] Auto-match provides reasonable suggestions
- [x] CSV export contains correct data
- [x] Core features still work perfectly after bonus additions

## Expected Output
- 2-4 bonus features implemented
- No regression in mandatory features

## DEPENDENCIES
Phases 1-5 (all mandatory features complete)

## PRODUCES
- Bonus scoring points
- Enhanced user experience

---

## Phase 6 — Implementation Prompt

```
You are implementing Phase 6 of the Tender Document Package Builder.

Follow ARCHITECTURE.md and IMPLEMENTATION_PLAN.md strictly.

IMPLEMENT ONLY PHASE 6 — High-Value Bonus Features.

ALL mandatory features (M1-M9) are complete and working. DO NOT BREAK THEM.

Implement bonus features in this priority order (stop if running low on time):

1. B7 — Safe bad file handling: Update fileProcessor.js to catch pdf.js PasswordException and InvalidPDFException, show specific error messages, never crash.

2. B6 — Auto-match: Add suggestMatches() to matcher.js using filename-to-title substring matching (lowercase). Add "Auto-match" button to matchingUI.js that applies suggestions with user confirmation.

3. B3 — CSV Export: Create js/exporter.js. Build CSV: Document Name, File Name, Pages, Expiry Date, Status. Download as <tender_id>_Checklist.csv. Add "Export CSV" button.

4. B1 — Index Page (only if time permits): In packageGenerator.js, add index page after cover showing document names and their starting page numbers. Update total page count to include index page.

CRITICAL: Do not break any mandatory feature. Test core workflow after each bonus addition.
Do NOT run git commit or git push.
```

---

# Phase 7 — Final QA & Deployment Readiness

## Objective
Final quality assurance, generate the sample pack output, take screenshots, ensure deployment readiness, and prepare all submission artifacts.

## Scope
- End-to-end test with provided sample pack
- Generate `output/<tender_id>_Package.pdf` from sample pack
- Take screenshots for `screenshots/` directory
- Verify public deployment works
- Final code review for any bugs

## Dependencies

| Dependency | From Phase |
|------------|-----------|
| All features | Phases 1-6 |

## Files / Modules

| File | Action |
|------|--------|
| `output/<tender_id>_Package.pdf` | Generate |
| `screenshots/` | Create with screenshot files |
| `README.md` | Update with project description |

## Features
- Complete end-to-end validation
- Submission artifact generation

## DOES NOT INCLUDE
- New feature development
- Architecture changes

## Implementation Steps
1. Load the provided `sample-pack.zip` requirements.json into the app
2. Upload the provided sample PDFs
3. Identify and resolve the "real-life problems hidden in the sample pack" (duplicates, expired docs, etc.)
4. Match all files to requirements
5. Enter expiry dates
6. Verify all statuses are correct
7. Generate the package
8. Save to `output/<tender_id>_Package.pdf`
9. Take screenshot(s) showing document statuses → save to `screenshots/`
10. Test the deployed version (public HTTPS URL)
11. Verify the app works with the deployed version
12. Update README.md with project overview

## Testing
- Full end-to-end with sample pack
- Verify output PDF: cover page, ordering, footers, page count
- Verify deployment URL loads and works

## Acceptance Criteria
- [x] `output/<tender_id>_Package.pdf` exists and is correct
- [x] `screenshots/` contains status screenshot(s)
- [x] Deployed version works identically to local
- [x] README.md updated
- [x] No console errors

## Expected Output
- All submission artifacts ready
- Application deployment verified

## DEPENDENCIES
All previous phases

## PRODUCES
- Submission-ready repository

---

## Phase 7 — Implementation Prompt

```
You are implementing Phase 7 of the Tender Document Package Builder.

Follow ARCHITECTURE.md and IMPLEMENTATION_PLAN.md strictly.

IMPLEMENT ONLY PHASE 7 — Final QA & Deployment Readiness.

All features are implemented. This phase is QA and submission preparation ONLY.

1. Load the sample-pack.zip requirements.json into the app
2. Upload the sample PDFs
3. Find and resolve the hidden problems (look for: duplicate files, expired documents, missing required docs)
4. Match all files, enter expiry dates, resolve all blocking statuses
5. Generate the final package
6. Save the output as output/<tender_id>_Package.pdf
7. Take a screenshot showing all document statuses and save to screenshots/
8. Update README.md with project description, tech stack, and setup instructions
9. Verify the app works in latest Chrome
10. Report any bugs found

DO NOT add new features. DO NOT modify architecture.
Do NOT run git commit or git push.
```

---

# Phase Dependency & Overlap Audit

## Feature Ownership Table

| Feature | Primary Phase | Dependencies |
|---------|---------------|--------------|
| HTML structure / index.html | Phase 1 | None |
| CSS design system / styles.css | Phase 1 | None |
| Central state management (state.js) | Phase 1 | None |
| i18n system (translations, t(), language switch) | Phase 1 | None |
| App initialization (app.js) | Phase 1 | None |
| Render orchestrator (renderer.js) | Phase 1 | None |
| Module stubs (all JS files) | Phase 1 | None |
| Requirements JSON loading & validation | Phase 2 | Phase 1 |
| Tender info display | Phase 2 | Phase 1 |
| Requirements list display (sorted by order) | Phase 2 | Phase 1 |
| PDF upload with type validation | Phase 2 | Phase 1 |
| PDF page counting (pdf.js) | Phase 2 | Phase 1 |
| SHA-256 content hashing | Phase 2 | Phase 1 |
| File removal | Phase 2 | Phase 1 |
| File limit enforcement (30 / 50 MB) | Phase 2 | Phase 1 |
| Notification/toast system | Phase 2 | Phase 1 |
| File-to-requirement matching (one-to-one) | Phase 3 | Phases 1-2 |
| Match change / undo | Phase 3 | Phases 1-2 |
| Expiry date entry | Phase 3 | Phases 1-2 |
| Status engine (all 5 statuses) | Phase 3 | Phases 1-2 |
| Same-day expiry edge case | Phase 3 | Phases 1-2 |
| Blocking status aggregation | Phase 3 | Phases 1-2 |
| Generate button disabled state + reasons | Phase 3 | Phases 1-2 |
| Duplicate detection (SHA-256 grouping) | Phase 4 | Phases 1-2 |
| Duplicate UI badges | Phase 4 | Phases 1-2 |
| Duplicate matching constraint enforcement | Phase 4 | Phases 1-3 |
| Cover page generation (English) | Phase 4 | Phases 1-3 |
| Document merging (correct order) | Phase 4 | Phases 1-3 |
| Footer stamping (Page X of Y) | Phase 4 | Phases 1-3 |
| Total page count calculation | Phase 4 | Phases 1-3 |
| PDF download (<tender_id>_Package.pdf) | Phase 4 | Phases 1-3 |
| Complete BN translations | Phase 5 | Phases 1-4 |
| All UI text bilingual audit | Phase 5 | Phases 1-4 |
| Error handling polish | Phase 5 | Phases 1-4 |
| Visual polish / transitions | Phase 5 | Phases 1-4 |
| Bad PDF handling (B7) | Phase 6 | Phases 1-5 |
| Auto-match (B6) | Phase 6 | Phases 1-5 |
| CSV export (B3) | Phase 6 | Phases 1-5 |
| Index page (B1) | Phase 6 | Phases 1-5 |
| Sample pack output generation | Phase 7 | Phases 1-6 |
| Screenshots | Phase 7 | Phases 1-6 |
| README update | Phase 7 | Phases 1-6 |
| Deployment verification | Phase 7 | Phases 1-6 |

## Overlap Verification

**No feature appears as primary owner in more than one phase.** ✓

- State management → Phase 1 only (later phases use it, not re-implement it)
- i18n dictionary → Phase 1 creates it, Phase 5 completes it (distinct scope: creation vs. completion)
- Status engine → Phase 3 only
- Duplicate detection → Phase 4 only
- Package generation → Phase 4 only
- Language switching → Phase 1 creates mechanism, Phase 5 verifies completeness

## Dependency Chain

```
Phase 1  →  Phase 2  →  Phase 3  →  Phase 4  →  Phase 5  →  Phase 6  →  Phase 7
(Shell)    (Load+Up)   (Match+St)  (Dup+Pkg)   (i18n+Pol)  (Bonus)     (QA)
```

Each phase strictly depends on all prior phases. No phase can be skipped.

---

# Risk Assessment

## Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| pdf-lib cover page text layout issues | Medium | Medium | Use simple text positioning; avoid complex layouts |
| Large PDF merging performance | Low | Medium | 50 MB limit keeps this manageable in Chrome |
| CDN library unavailability | Low | High | Pin specific CDN versions; test at start |
| pdf.js worker configuration issues | Medium | Medium | Use `pdfjsLib.GlobalWorkerOptions.workerSrc` or disable worker |
| SHA-256 hashing performance | Low | Low | Web Crypto API is optimized; 50 MB total is fast |
| Footer covering document content | Medium | Medium | Use low y-position (20pt) consistently |

## Time Risks

| Risk | Mitigation |
|------|------------|
| Phase 4 (package generation) takes too long | Start with simplest cover page; iterate if time |
| Bangla translations incomplete | Prioritize core UI strings; use English fallback |
| Sample pack has unexpected problems | Architecture is generic; not hardcoded |
| Deployment issues | Use simple static host (GitHub Pages, Netlify drop) |

---

# Mandatory vs Bonus Strategy

## Mandatory (Phases 1-5, ~70 min)
All M1-M9 features must be complete and working before any bonus work.
The Generate button must produce a correct PDF package.
The status engine must handle all edge cases correctly.
Bilingual UI must be functional.

## Bonus (Phase 6, ~10 min)
Only attempt if mandatory features are solid.
Priority order: B7 (safe errors) → B6 (auto-match) → B3 (CSV) → B1 (index page).
Each bonus feature is independent — implement as many as time allows.
Never sacrifice mandatory features for bonus points.

---

# Self-Audit Checklist

- [x] All Problem Statement requirements mapped to phases
- [x] No requirement silently ignored
- [x] Mandatory and bonus features clearly separated
- [x] Frontend-only constraint respected in all phases
- [x] Every phase has: Objective, Scope, Dependencies, Files, Features, DOES NOT INCLUDE, Steps, Testing, Acceptance Criteria
- [x] No feature overlap between phases
- [x] Every major feature has exactly one primary phase
- [x] Dependencies are explicit and directional
- [x] 90-minute constraint reflected in time budget
- [x] Implementation prompts are phase-specific and self-contained
- [x] No automatic Git operations planned
- [x] Phase Dependency & Overlap Audit table is complete
- [x] Unseen-pack compatibility maintained (no hardcoded data)
