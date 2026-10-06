# ARCHITECTURE.md — Tender Document Package Builder

---

## 1. Project Overview

**Competition:** AI DevFest — Vibe Coding  
**Build Time:** 90 minutes  
**Application:** Tender Document Package Builder  
**Type:** Frontend-only web application (browser-based, no backend)  
**Target Browser:** Latest Google Chrome  
**Languages:** English and Bangla (bilingual UI)

The application helps office staff assemble a set of PDF documents into a single, validated, correctly-ordered tender submission package — entirely within the browser.

---

## 2. Problem Definition

### 2.1 Domain Context

When organizations issue tenders, bidders must submit a prescribed set of documents (trade licenses, certificates, proposals, etc.) in a specific order. Some documents are mandatory, some optional, and some have expiry dates that must be valid on the submission deadline. This process is currently manual, error-prone, and time-consuming.

### 2.2 Core Problem

Manual tender document assembly leads to:
- Missing required documents
- Expired documents being included
- Duplicate files going undetected
- Incorrect document ordering
- Incomplete or rejected bids

### 2.3 Solution

A browser-based tool that:
1. Reads a `requirements.json` describing tender details and required documents
2. Accepts PDF file uploads from the user
3. Lets the user match files to requirements
4. Validates everything (expiry, completeness, duplicates)
5. Generates a single, correctly-ordered PDF package with cover page and footers
6. Works entirely client-side with no server dependency

---

## 3. Product Goals

1. **Correctness:** Every required document status must be accurate per the status rules
2. **Reliability:** The app must work with any unseen sample pack in the defined JSON format
3. **Usability:** An office worker with no tech skills must be able to complete the task in either language without help
4. **Compliance:** The generated PDF must exactly follow the Package Rules (Section 6 of Problem Statement)

---

## 4. Functional Requirements

### 4.1 MANDATORY (Must Do — Tasks 4.1–4.9)

| ID | Feature | Reference |
|----|---------|-----------|
| M1 | Load `requirements.json`, display tender details and document list sorted by `order` | Task 4.1 |
| M2 | Upload multiple PDF files at once; show filename and page count; reject non-PDFs with clear message; allow removal | Task 4.2 |
| M3 | One-to-one matching: user matches each uploaded file to one required document; changeable/undoable | Task 4.3 |
| M4 | Expiry date entry for `has_expiry = true` documents when a file is matched | Task 4.4 |
| M5 | Real-time status calculation per Section 5 rules; updates after every change | Task 4.5 |
| M6 | Exact-content duplicate detection across uploaded files (even with different names); block duplicate files from being matched to different documents | Task 4.6 |
| M7 | Generate button disabled while any blocking status exists; show reason; generate combined PDF per Section 6 | Task 4.7 |
| M8 | Download as `<tender_id>_Package.pdf` | Task 4.8 |
| M9 | Bilingual UI: switch entire app between English and Bangla; use `title_en` / `title_bn` accordingly | Task 4.9 |

### 4.2 BONUS (Optional — Section 7)

| ID | Feature | Value Assessment |
|----|---------|-----------------|
| B1 | Index page after cover, showing page number where each document starts | HIGH VALUE |
| B2 | Seal/signature: upload PNG, place on chosen pages | MEDIUM VALUE |
| B3 | Export checklist as Excel/CSV (document, file name, pages, expiry, status) | HIGH VALUE |
| B4 | Save and reopen work (export/import project file or browser storage) | MEDIUM VALUE |
| B5 | Bangla text on PDF cover/index page | MEDIUM VALUE |
| B6 | Auto-match: suggest matches based on filenames | HIGH VALUE |
| B7 | Handle damaged/password-protected PDFs gracefully (clear message, no crash) | HIGH VALUE |
| B8 | AI help using user's own API key | LOW VALUE |

---

## 5. Non-Functional Requirements

| Requirement | Detail |
|-------------|--------|
| **Platform** | Frontend only — all processing in browser |
| **No Backend** | No participant-controlled backend, database, or online storage for documents |
| **File Limits** | Max 30 PDF files, max 50 MB total |
| **Browser** | Latest Google Chrome |
| **Deployment** | Public HTTPS live website, accessible without login |
| **Performance** | Must handle 30 PDFs / 50 MB without freezing Chrome |
| **Unseen Pack** | Must work with any `requirements.json` + documents in the defined format |
| **Accessibility** | Usable by non-technical office workers |

---

## 6. User Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. LOAD         User opens/uploads requirements.json               │
│       ↓          App displays tender info + document list           │
│                                                                     │
│  2. UPLOAD       User uploads PDF files (multi-select)              │
│       ↓          App shows filenames, page counts, rejects non-PDFs │
│                                                                     │
│  3. MATCH        User matches each file → one requirement           │
│       ↓          One-to-one binding, changeable/undoable            │
│                                                                     │
│  4. EXPIRY       User enters expiry dates where has_expiry=true     │
│       ↓          App validates against submission_deadline          │
│                                                                     │
│  5. REVIEW       App shows real-time status for every requirement   │
│       ↓          Blocking statuses disable Generate button          │
│                                                                     │
│  6. GENERATE     User clicks Generate (enabled when no blockers)    │
│       ↓          App creates combined PDF with cover + footers      │
│                                                                     │
│  7. DOWNLOAD     User downloads <tender_id>_Package.pdf             │
│                                                                     │
│  ★ LANGUAGE      User can switch EN↔BN at any point                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Core User Flows

### 7.1 Happy Path
1. Load `requirements.json` → see tender details
2. Upload matching PDFs → see page counts
3. Match each file to its requirement
4. Enter valid expiry dates
5. All statuses → OK / Not provided
6. Generate → Download

### 7.2 Missing Required Document
1. A mandatory requirement has no matched file
2. Status shows "Missing" (blocking)
3. Generate button stays disabled with explanation

### 7.3 Expired Document
1. User enters an expiry date before `submission_deadline`
2. Status shows "Expired" (blocking)
3. User must either: remove the match, or change the expiry date

### 7.4 Duplicate Files Detected
1. Two uploaded files have identical content but different names
2. Both are flagged as duplicates in the file list
3. They cannot be matched to different requirements

### 7.5 Optional Document Omitted
1. An optional requirement has no matched file
2. Status shows "Not provided" (non-blocking)
3. Document is skipped in the final package

---

## 8. Application Architecture

### 8.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Structure** | HTML5 | Semantic, accessible markup |
| **Styling** | Vanilla CSS | Maximum control, no build step needed |
| **Logic** | Vanilla JavaScript (ES Modules) | No framework overhead; fast to implement |
| **PDF Parsing** | pdf.js (CDN) | Page counting, content reading, previews |
| **PDF Generation** | pdf-lib (CDN) | Combining PDFs, adding cover page, adding footers |
| **Hashing** | Web Crypto API (`crypto.subtle.digest`) | SHA-256 for exact-content duplicate detection |
| **Date Handling** | Native `Date` / string comparison | YYYY-MM-DD format allows lexicographic comparison |
| **Bundling** | None | Single-page app loaded directly; no build tool needed |

### 8.2 Why No Framework

- 90-minute build time precludes framework setup overhead
- The app is a single-page tool, not a multi-route SPA
- Vanilla JS with ES modules is sufficient for this complexity level
- No build step = instant deployability to any static host

### 8.3 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                                                                  │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────────────────┐ │
│  │   UI Layer   │──▶│  App State   │──▶│  Status Engine        │ │
│  │  (DOM/CSS)   │◀──│  (Central)   │◀──│  (Business Logic)     │ │
│  └─────────────┘   └──────┬───────┘   └───────────────────────┘ │
│                           │                                      │
│              ┌────────────┼────────────┐                         │
│              ▼            ▼            ▼                          │
│  ┌───────────────┐ ┌──────────┐ ┌──────────────────┐            │
│  │ File Processor │ │ Matcher  │ │ Package Generator │            │
│  │ (pdf.js)       │ │          │ │ (pdf-lib)         │            │
│  └───────────────┘ └──────────┘ └──────────────────┘            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │                    i18n Layer (EN/BN)                         ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Component Architecture

### 9.1 UI Components (Rendering Modules)

| Component | Responsibility |
|-----------|---------------|
| `TenderInfoPanel` | Displays tender ID, title, procuring entity, bidder, deadline |
| `RequirementsTable` | Lists required documents sorted by `order`, with status badges |
| `FileUploadZone` | Drag-and-drop / file picker; shows uploaded files with page counts |
| `FileList` | Displays uploaded files, page counts, duplicate badges, remove buttons |
| `MatchingInterface` | Dropdown/assignment UI for matching files ↔ requirements |
| `ExpiryDateInput` | Date picker shown when `has_expiry = true` and file is matched |
| `StatusBadge` | Color-coded status indicator (Missing/Expiry needed/Expired/Not provided/OK) |
| `GenerateButton` | Disabled with tooltip when blocking statuses exist; triggers package generation |
| `LanguageSwitcher` | Toggle between English and Bangla |
| `ProgressIndicator` | Shows PDF generation progress |

### 9.2 Logic Modules

| Module | Responsibility |
|--------|---------------|
| `state.js` | Central application state management |
| `statusEngine.js` | Document status calculation (pure business logic) |
| `fileProcessor.js` | PDF validation, page counting, content hashing |
| `matcher.js` | Matching logic and constraints |
| `duplicateDetector.js` | Content-hash-based duplicate detection |
| `packageGenerator.js` | Cover page, document merging, footer stamping |
| `i18n.js` | Translation strings and language switching |
| `requirementsLoader.js` | JSON parsing and validation |

---

## 10. State / Data Architecture

### 10.1 Central State Object

The entire application state is held in a single JavaScript object. All mutations go through a central `updateState()` function that triggers re-rendering and status recalculation.

```javascript
// Conceptual state shape
const AppState = {
  // From requirements.json
  tender: {
    tender_id: String,       // e.g., "T-2026-0417"
    title: String,           // e.g., "Supply of IT Equipment"
    procuring_entity: String,
    bidder: String,
    submission_deadline: String  // "YYYY-MM-DD"
  },
  
  // Parsed requirements, sorted by order
  requirements: [
    {
      id: String,            // e.g., "R01"
      order: Number,         // 1-based sort order
      title_en: String,
      title_bn: String,
      mandatory: Boolean,
      has_expiry: Boolean
    }
  ],
  
  // Uploaded files
  uploadedFiles: [
    {
      fileId: String,        // Generated unique ID
      name: String,          // Original filename
      size: Number,          // Bytes
      pageCount: Number,     // From pdf.js
      contentHash: String,   // SHA-256 of ArrayBuffer
      arrayBuffer: ArrayBuffer, // Raw file data for PDF generation
      isDuplicate: Boolean,  // Set by duplicate detector
      duplicateGroupId: String // Groups identical files
    }
  ],
  
  // Matching: requirement ID -> file ID
  matches: {
    // [requirementId]: fileId | null
  },
  
  // Expiry dates: requirement ID -> date string
  expiryDates: {
    // [requirementId]: "YYYY-MM-DD" | null
  },
  
  // Computed statuses (recalculated on every change)
  statuses: {
    // [requirementId]: "Missing" | "Expiry date needed" | "Expired" | "Not provided" | "OK"
  },
  
  // UI state
  language: "en", // or "bn"
  isGenerating: false,
  generatedPackage: null, // Blob | null
  
  // Computed
  hasBlockingStatus: false,
  blockingReasons: []
};
```

### 10.2 State Flow

```
User Action (upload/match/expiry/remove)
       ↓
  updateState()
       ↓
  ┌────────────────────┐
  │ Duplicate Detector  │  ← runs on file add/remove
  └────────┬───────────┘
           ↓
  ┌────────────────────┐
  │   Status Engine     │  ← recalculates ALL statuses
  └────────┬───────────┘
           ↓
  ┌────────────────────┐
  │    Re-render UI     │  ← updates DOM based on new state
  └────────────────────┘
```

---

## 11. Domain Model

### 11.1 Requirement Model

```
Requirement {
  id: String           // Unique identifier (e.g., "R01")
  order: Number        // Position in final package (1 = first)
  title_en: String     // English document name
  title_bn: String     // Bangla document name
  mandatory: Boolean   // true = required, false = optional
  has_expiry: Boolean  // true = expiry date must be checked
}
```

**Invariants:**
- `order` values define strict document sequence in the package
- `id` values are unique within a requirements set
- The set of requirements is immutable after loading

### 11.2 Uploaded File Model

```
UploadedFile {
  fileId: String         // UUID generated at upload time
  name: String           // Original filename from user's system
  size: Number           // File size in bytes
  pageCount: Number      // Number of pages (from pdf.js)
  contentHash: String    // SHA-256 hex digest of the file's ArrayBuffer
  arrayBuffer: ArrayBuffer // Raw binary data for later PDF operations
  isDuplicate: Boolean   // True if another file has the same contentHash
  duplicateGroupId: String|null // Shared ID among files with same hash
}
```

**Invariants:**
- Only valid PDF files are stored (non-PDFs rejected at upload)
- `contentHash` is computed from the complete file binary content
- `arrayBuffer` is retained for use by the package generator
- Maximum 30 files, maximum 50 MB total across all files

### 11.3 Matching Model

```
Matching:
  Map<requirementId, fileId | null>

Constraints:
  - One requirement -> at most one file
  - One file -> at most one requirement (injective)
  - Duplicate files (same contentHash) CANNOT be matched to DIFFERENT requirements
  - User can change or undo any match at any time
```

**Duplicate matching rule (critical):**
If files A and B have the same `contentHash`, and file A is matched to requirement R1, then file B cannot be matched to any requirement other than R1 (and vice versa). In practice, since one requirement gets at most one file, this means only one file from a duplicate group can be matched at all.

### 11.4 Status Model

See Section 12 (Status Engine) for the complete specification.

---

## 12. Status Engine

### 12.1 Overview

The Status Engine is a **pure business-logic component** — it takes the current state as input and produces a status for every requirement. It has no UI dependencies.

### 12.2 Status Enumeration

| Status | Display Text | Blocking? |
|--------|-------------|-----------|
| `MISSING` | Missing | **Yes** |
| `EXPIRY_DATE_NEEDED` | Expiry date needed | **Yes** |
| `EXPIRED` | Expired | **Yes** |
| `NOT_PROVIDED` | Not provided | No |
| `OK` | OK | No |

### 12.3 Status Decision Logic

For each requirement, exactly one status is determined by the following rules, evaluated **in this priority order**:

```
function computeStatus(requirement, matchedFileId, expiryDate, submissionDeadline):

  IF matchedFileId is null:
    IF requirement.mandatory == true:
      RETURN "Missing"          // Blocking
    ELSE:
      RETURN "Not provided"     // Non-blocking
  
  // A file is matched from here onward
  
  IF requirement.has_expiry == true:
    IF expiryDate is null or empty:
      RETURN "Expiry date needed"  // Blocking
    
    IF expiryDate < submissionDeadline:
      RETURN "Expired"             // Blocking
    
    // expiryDate >= submissionDeadline (includes same-day)
    RETURN "OK"
  
  // has_expiry is false, file is matched
  RETURN "OK"
```

### 12.4 Critical Edge Cases

| Case | Expected Status |
|------|----------------|
| Mandatory, no file matched | Missing |
| Optional, no file matched | Not provided |
| File matched, has_expiry=true, no date entered | Expiry date needed |
| File matched, has_expiry=true, expiry = 2026-10-19, deadline = 2026-10-20 | Expired |
| File matched, has_expiry=true, expiry = 2026-10-20, deadline = 2026-10-20 | **OK** (same-day rule) |
| File matched, has_expiry=true, expiry = 2026-10-21, deadline = 2026-10-20 | OK |
| File matched, has_expiry=false | OK |

### 12.5 Date Comparison Strategy

Since all dates use `YYYY-MM-DD` format, **lexicographic string comparison** is both correct and sufficient:

```javascript
const isExpired = expiryDate < submissionDeadline;  // string comparison
const isOK = expiryDate >= submissionDeadline;       // includes same-day
```

No Date object parsing is required for comparison, though Date objects may be used for the date picker UI.

### 12.6 Blocking Status Aggregation

```javascript
function getBlockingStatuses(statuses, requirements) {
  return requirements
    .filter(req => ["Missing", "Expiry date needed", "Expired"].includes(statuses[req.id]))
    .map(req => ({ requirement: req, status: statuses[req.id] }));
}
```

The Generate button is disabled if `getBlockingStatuses().length > 0`. The UI displays each blocking reason.

---

## 13. Duplicate Detection Architecture

### 13.1 Strategy: SHA-256 Content Hashing

**What is compared:** The entire binary content (ArrayBuffer) of each PDF file.

**How duplicate identity is calculated:**
1. When a file is uploaded, compute `SHA-256` hash of its `ArrayBuffer` using `crypto.subtle.digest`
2. The resulting hex string is the file's `contentHash`
3. Two files are duplicates if and only if they have the same `contentHash`

**Why SHA-256:**
- Built into every modern browser via Web Crypto API (no library needed)
- Collision probability is negligible
- Fast enough for files up to 50 MB total
- Content-based, not filename-based (as required)

### 13.2 Detection Timing

Duplicate detection runs:
1. **On every file upload** — new file's hash is compared against all existing files
2. **On file removal** — duplicate groups are recalculated (a group may dissolve if only one member remains)

### 13.3 Duplicate Group Model

```javascript
// After hashing all files, group by contentHash:
// duplicateGroups = {
//   [contentHash]: [fileId1, fileId2, ...]  // only entries with 2+ files
// }

// Each file in a duplicate group gets:
// file.isDuplicate = true
// file.duplicateGroupId = contentHash
```

### 13.4 Duplicate Impact on Matching

**Rule:** Files within the same duplicate group cannot be matched to **different** requirements.

**Implementation:**
- When user tries to match file F to requirement R:
  - If F is a duplicate, check if any other file in F's duplicate group is already matched to a different requirement
  - If so, **block the match** and show a message: "This file is a duplicate of [other filename], which is already matched to [requirement name]"
- This naturally prevents the same document content from appearing under two different requirements

### 13.5 UI Communication of Duplicates

- Duplicate files in the file list show a visual badge (e.g., "⚠ Duplicate")
- The badge identifies which other file(s) share the same content
- Attempting to match a duplicate when its sibling is already matched elsewhere produces a clear error message

---

## 14. PDF Processing Architecture

### 14.1 File Upload Processing Pipeline

```
User selects files
       ↓
┌─────────────────────┐
│  Type Validation     │  Reject if not .pdf or MIME != application/pdf
└────────┬────────────┘
         ↓
┌─────────────────────┐
│  Size Validation     │  Reject if total > 50MB or count > 30
└────────┬────────────┘
         ↓
┌─────────────────────┐
│  Read ArrayBuffer    │  FileReader.readAsArrayBuffer()
└────────┬────────────┘
         ↓
┌─────────────────────────────────┐
│  PDF Validation & Page Count    │  pdf.js: pdfjsLib.getDocument(data)
│  (confirms valid PDF structure) │  doc.numPages -> pageCount
└────────┬────────────────────────┘
         ↓
┌─────────────────────┐
│  Content Hashing     │  crypto.subtle.digest('SHA-256', arrayBuffer)
└────────┬────────────┘
         ↓
┌─────────────────────┐
│  Duplicate Check     │  Compare hash against existing files
└────────┬────────────┘
         ↓
  Store in AppState.uploadedFiles
```

### 14.2 PDF Validation

Using pdf.js to validate:
```javascript
try {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  // Valid PDF
} catch (error) {
  // Invalid, damaged, or password-protected PDF
  // Show clear error message, do not crash
}
```

### 14.3 Library Loading Strategy

Both libraries loaded via CDN in `index.html`:
```html
<!-- pdf.js for reading/validating PDFs -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>

<!-- pdf-lib for creating/merging PDFs -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
```

---

## 15. Package Generation Architecture

### 15.1 Generation Pipeline

```
Validated State (no blocking statuses)
       ↓
┌──────────────────────────┐
│ 1. Determine Inclusions   │  Filter: matched requirements, sorted by order
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ 2. Count Total Pages      │  Cover (1 page) + sum of all included file page counts
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ 3. Create New PDF          │  PDFDocument.create() via pdf-lib
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ 4. Generate Cover Page     │  English only; tender info + document list
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ 5. Append Documents       │  Copy pages from each matched file, in order
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ 6. Stamp Footers           │  Every page: "<tender_id> | Page X of Y"
└────────┬─────────────────┘
         ↓
┌──────────────────────────┐
│ 7. Serialize & Download    │  pdfDoc.save() -> Blob -> download link
└──────────────────────────┘
```

### 15.2 Cover Page Specification

**Language:** Always English (mandatory per Problem Statement 6.1).

**Content:**
- Tender ID
- Tender Title
- Procuring Entity
- Bidder Name
- Submission Deadline
- Date Package Was Generated (today's date)
- List of included documents in order (requirement title_en + order number)

**Layout:** Clean, professional single page using pdf-lib's text drawing capabilities.

### 15.3 Document Ordering

Documents are included after the cover page, sorted by the `order` field from `requirements.json`.

- Each matched requirement's file has ALL its pages copied in original page order
- Optional documents with no file matched -> skipped entirely
- This ordering is deterministic and data-driven

### 15.4 Footer Specification

**Format:** `<tender_id> | Page X of Y`

**Where:**
- `tender_id` — from the loaded tender data
- `X` — current page number (1-indexed, cover = Page 1)
- `Y` — total page count of the entire package

**Placement:**
- Bottom center of every page (including cover)
- Small font size (e.g., 10pt)
- Must not cover document content -> placed in the bottom margin area
- Use a consistent y-position (e.g., 30 points from bottom edge)

**Total Page Count Calculation:**
```
Y = 1 (cover) + sum(pageCount of each included file)
```

This value is known **before** stamping begins, because we count all pages first (step 2 in the pipeline). The footer text uses this pre-calculated total.

### 15.5 Footer Implementation Strategy

```javascript
// After all pages are assembled:
const totalPages = pdfDoc.getPageCount();

for (let i = 0; i < totalPages; i++) {
  const page = pdfDoc.getPage(i);
  const { width } = page.getSize();
  const footerText = `${tenderId} | Page ${i + 1} of ${totalPages}`;
  
  page.drawText(footerText, {
    x: width / 2 - (footerText.length * 3), // approximate centering
    y: 20,                                     // 20pt from bottom
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3)
  });
}
```

### 15.6 Download

```javascript
const pdfBytes = await pdfDoc.save();
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);

const link = document.createElement('a');
link.href = url;
link.download = `${tenderId}_Package.pdf`;
link.click();

URL.revokeObjectURL(url);
```

---

## 16. Internationalization (i18n) Architecture

### 16.1 Design Principles

- **Separation:** i18n is a translation layer over the UI — it does NOT duplicate business logic
- **Data-Driven Document Names:** Requirements already carry `title_en` and `title_bn`; the UI selects the correct field based on current language
- **Static UI Strings:** All UI labels, buttons, status names, error messages stored in a translation dictionary
- **Cover Page Exception:** The generated PDF cover page is always in English (mandatory requirement)

### 16.2 Translation Dictionary Structure

```javascript
const translations = {
  en: {
    appTitle: "Tender Document Package Builder",
    loadRequirements: "Load Requirements",
    uploadFiles: "Upload PDF Files",
    generate: "Generate Package",
    download: "Download Package",
    status: {
      missing: "Missing",
      expiryNeeded: "Expiry date needed",
      expired: "Expired",
      notProvided: "Not provided",
      ok: "OK"
    },
    errors: {
      notPdf: "Only PDF files are accepted",
      tooManyFiles: "Maximum 30 files allowed",
      tooLarge: "Total file size exceeds 50 MB",
      duplicateMatch: "This file is a duplicate and cannot be matched separately"
    },
    // ... more strings
  },
  bn: {
    appTitle: "টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার",
    // ... Bangla equivalents
  }
};
```

### 16.3 Language Switching Mechanism

```javascript
function setLanguage(lang) {
  state.language = lang;
  // Re-render all UI components with new language
  renderAll();
}

function t(key) {
  return translations[state.language][key];
}

function getDocTitle(requirement) {
  return state.language === 'bn' ? requirement.title_bn : requirement.title_en;
}
```

### 16.4 What Changes on Language Switch

| Element | Behavior |
|---------|----------|
| UI labels, buttons, headings | Switch to selected language |
| Document names in requirement list | Use `title_bn` or `title_en` |
| Status text | Translated status names |
| Error messages | Translated messages |
| Cover page in generated PDF | **Always English** (not affected by switch) |

---

## 17. Validation Architecture

### 17.1 Input Validation

| Validation | When | Action |
|------------|------|--------|
| `requirements.json` structure | On load | Verify required fields exist; show error if malformed |
| File type (PDF only) | On upload | Check MIME type and/or extension; reject with message |
| File count <= 30 | On upload | Reject additional files if limit reached |
| Total size <= 50 MB | On upload | Reject if cumulative size would exceed 50 MB |
| PDF validity | On upload | Try opening with pdf.js; reject if corrupt |

### 17.2 Business Rule Validation

| Validation | When | Action |
|------------|------|--------|
| One-to-one match constraint | On match attempt | Prevent if file/requirement already matched |
| Duplicate match constraint | On match attempt | Prevent if duplicate file's sibling matched elsewhere |
| Expiry date required | Real-time | Status = "Expiry date needed" |
| Expiry date validity | Real-time | Status = "Expired" if before deadline |
| Package generation readiness | Real-time | Disable Generate if any blocking status |

### 17.3 Package Validation (Pre-Generation)

Before generating:
1. Confirm no blocking statuses exist
2. Confirm at least one document is included
3. Confirm all matched files' ArrayBuffers are still available

---

## 18. Error Handling

### 18.1 Error Categories

| Category | Examples | Handling |
|----------|----------|---------|
| **User Input Error** | Wrong file type, too many files, size exceeded | Clear message in UI; no crash |
| **Data Error** | Malformed `requirements.json` | Show what's wrong; prevent proceeding |
| **PDF Error** | Corrupt/damaged PDF | Reject the specific file with clear message |
| **Generation Error** | pdf-lib failure during package creation | Show error message; allow retry |
| **Unexpected Error** | JavaScript runtime error | Global error handler; show generic message |

### 18.2 Error Display Strategy

- Errors appear as dismissible notifications or inline messages
- File-specific errors appear next to the affected file in the file list
- Status-related issues appear as blocking reasons near the Generate button
- No error should cause the application to crash or become unusable

---

## 19. Browser / File Processing Strategy

### 19.1 File Reading

All files are read using the browser's FileReader API:
```javascript
function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
```

### 19.2 Memory Management

- ArrayBuffers are held in memory for the session (needed for package generation)
- With max 50 MB total, this is well within Chrome's memory capacity
- Files removed by the user have their ArrayBuffer reference dropped for GC

### 19.3 Async Processing

- File reading, hashing, and PDF validation are async operations
- Use `Promise.all` for parallel processing of multiple uploaded files
- Package generation is async; show progress indicator
- UI remains responsive during processing via `async/await`

---

## 20. Folder / File Structure

```
devfest--Md.Farhan-Sadik-Udoy-/
├── index.html                  # Single HTML entry point
├── css/
│   └── styles.css              # All styles (design system + components)
├── js/
│   ├── app.js                  # Main app initialization and orchestration
│   ├── state.js                # Central state management
│   ├── requirementsLoader.js   # Load and parse requirements.json
│   ├── fileProcessor.js        # PDF upload, validation, page counting, hashing
│   ├── duplicateDetector.js    # Content-hash duplicate detection
│   ├── matcher.js              # File-to-requirement matching logic
│   ├── statusEngine.js         # Status calculation (pure business logic)
│   ├── packageGenerator.js     # Cover page + merge + footers + download
│   ├── i18n.js                 # Translation strings and language switching
│   └── ui/
│       ├── renderer.js         # Main render orchestrator
│       ├── tenderInfo.js       # Tender details panel
│       ├── requirementsList.js # Requirements table with statuses
│       ├── fileUpload.js       # Upload zone and file list
│       ├── matchingUI.js       # Matching interface
│       └── notifications.js   # Error/success messages
├── output/                     # Generated package goes here (for submission)
│   └── (generated at runtime)
├── screenshots/                # Required for submission
├── ARCHITECTURE.md             # This document
├── IMPLEMENTATION_PLAN.md      # Phase-by-phase build plan
└── README.md                   # Project description
```

---

## 21. Dependency Strategy

### 21.1 External Dependencies (CDN Only)

| Library | Version | Purpose | Required? |
|---------|---------|---------|-----------|
| **pdf.js** | 3.11.174 | PDF parsing, page counting, validation | Yes |
| **pdf-lib** | 1.17.1 | PDF creation, merging, footer stamping | Yes |

### 21.2 No Build Dependencies

- No npm/yarn packages installed locally
- No webpack/vite/rollup build step
- No CSS preprocessors
- Libraries loaded via CDN `<script>` tags
- This enables instant deployment to any static file host

### 21.3 Browser APIs Used

| API | Purpose |
|-----|---------|
| `FileReader` | Reading uploaded files |
| `crypto.subtle.digest` | SHA-256 hashing for duplicate detection |
| `URL.createObjectURL` | Creating download links |
| `Blob` | Packaging generated PDF data |

---

## 22. Testing Architecture

### 22.1 Testing Strategy

Given the 90-minute time constraint, formal automated testing is impractical. Instead, the testing strategy is:

1. **Manual smoke testing** after each phase
2. **Edge case verification** using the provided sample pack
3. **Unseen-pack readiness** verified by testing with modified/custom `requirements.json`

### 22.2 Test Scenarios

#### Status Engine Tests
| Scenario | Input | Expected Status |
|----------|-------|----------------|
| Mandatory, no match | mandatory=true, file=null | Missing |
| Optional, no match | mandatory=false, file=null | Not provided |
| Matched, no expiry needed | has_expiry=false, file=matched | OK |
| Matched, expiry needed, no date | has_expiry=true, date=null | Expiry date needed |
| Matched, expired | has_expiry=true, date < deadline | Expired |
| Matched, same-day expiry | has_expiry=true, date == deadline | OK |
| Matched, future expiry | has_expiry=true, date > deadline | OK |

#### Duplicate Detection Tests
| Scenario | Expected |
|----------|----------|
| Two identical files, different names | Both flagged as duplicates |
| File removed from duplicate pair | Remaining file unflagged |
| Duplicate matched, try matching sibling | Match blocked |

#### Package Generation Tests
| Scenario | Expected |
|----------|----------|
| Cover page content | All tender info + document list present |
| Document order | Matches `order` field from requirements |
| Page count | Cover + all included file pages |
| Footer format | `<tender_id> \| Page X of Y` on every page |
| Download filename | `<tender_id>_Package.pdf` |
| Optional omitted | Skipped in package |

#### Upload Tests
| Scenario | Expected |
|----------|----------|
| Non-PDF file | Rejected with clear message |
| 31st file | Rejected (max 30) |
| Over 50 MB total | Rejected |
| Valid PDF | Accepted, page count shown |

### 22.3 Unseen Pack Readiness Checklist

- [ ] App works with any valid `requirements.json` structure
- [ ] No hardcoded requirement IDs, titles, or counts
- [ ] No hardcoded document filenames
- [ ] Status engine is purely rule-based
- [ ] Package generator is data-driven

---

## 23. Extensibility Strategy

### 23.1 Bonus Feature Integration Points

The architecture is designed so bonus features can be added without modifying core logic:

| Bonus Feature | Integration Point | Core Impact |
|---------------|-------------------|-------------|
| Index page | `packageGenerator.js` — add page after cover, before documents | None (additive) |
| Seal/signature | `packageGenerator.js` — overlay PNG on specified pages | None (additive) |
| CSV/Excel export | New module `exporter.js` — reads state, generates file | None (read-only) |
| Save/reopen | New module `persistence.js` — serialize/deserialize state | Minimal (state access) |
| Bangla PDF text | `packageGenerator.js` — embed Bangla font in pdf-lib | None (additive) |
| Auto-match | `matcher.js` — add `suggestMatches()` function | None (additive) |
| Bad file handling | `fileProcessor.js` — already in try/catch design | None (already planned) |
| AI help | New module `aiHelper.js` — optional API key integration | None (additive) |

### 23.2 Design for Extension

- State is centralized -> any module can read it
- Status engine is a pure function -> can be unit tested independently
- UI rendering is component-based -> new sections can be added without touching existing ones
- Package generation is a pipeline -> new steps can be inserted

---

## 24. Data Flow Summary

```
requirements.json                    PDF Files (user upload)
       ↓                                    ↓
┌──────────────┐                   ┌─────────────────┐
│ Requirements  │                   │  File Processor  │
│ Loader        │                   │  (validate,      │
│               │                   │   count pages,   │
│ Parse JSON    │                   │   compute hash)  │
└──────┬───────┘                   └────────┬────────┘
       ↓                                    ↓
┌──────────────────────────────────────────────────┐
│                  APP STATE                        │
│  tender | requirements | files | matches | dates  │
└──────────────────────┬───────────────────────────┘
                       ↓
              ┌────────────────┐
              │ Duplicate      │
              │ Detector       │
              │ (hash groups)  │
              └───────┬────────┘
                      ↓
              ┌────────────────┐
              │ Status Engine  │
              │ (pure logic)   │
              │                │
              │ -> Missing     │
              │ -> Expiry need │
              │ -> Expired     │
              │ -> Not provid  │
              │ -> OK          │
              └───────┬────────┘
                      ↓
              ┌────────────────┐
              │   UI Render    │
              │ (all panels)   │
              └───────┬────────┘
                      ↓
         [User resolves all blockers]
                      ↓
              ┌────────────────┐
              │   Package      │
              │   Generator    │
              │                │
              │ 1. Cover page  │
              │ 2. Documents   │
              │ 3. Footers     │
              │ 4. Download    │
              └────────────────┘
                      ↓
         <tender_id>_Package.pdf
```

---

## 25. Self-Audit Checklist

- [x] Entire Problem Statement analyzed (Sections 1-10)
- [x] No requirement silently ignored
- [x] Mandatory (Tasks 4.1-4.9) and bonus (Section 7) clearly separated
- [x] Frontend-only constraint respected throughout
- [x] Unseen-pack compatibility: no hardcoded data, purely data-driven
- [x] Status rules explicitly modeled (Section 12, priority-ordered)
- [x] Same-day expiry edge case documented (Section 12.4)
- [x] Exact-content duplicate detection modeled (Section 13, SHA-256)
- [x] PDF package rules explicitly modeled (Section 15)
- [x] Footer Page X of Y fully accounted for (Section 15.4-15.5)
- [x] English cover page requirement documented (Section 15.2)
- [x] Bilingual UI architecture defined (Section 16)
- [x] Cover page always English, not affected by language switch
- [x] All major features have clear module ownership
- [x] Architecture supports bonus features without core rewrite
- [x] Date comparison uses string comparison for YYYY-MM-DD format
- [x] File limits (30 files, 50 MB) accounted for
- [x] Download filename `<tender_id>_Package.pdf` specified
- [x] No backend, database, or cloud storage designed
- [x] No automatic Git operations planned
