# Tender Document Package Builder

> **Competition:** AI DevFest 2026 — Vibe Coding  
> **Author:** Md. Farhan Sadik Udoy  
> **Architecture:** Frontend-Only Single Page Web Application (Vanilla HTML5 / Modern CSS / Vanilla ES Modules)

---

## 📌 Executive Summary

The **Tender Document Package Builder** is an intelligent, frontend-only browser application designed to streamline the assembly, validation, and generation of official tender document submission packages.

In tender submissions, small human errors such as omitted mandatory documents, expired licenses, duplicate file attachments, or out-of-order documents lead to immediate bid disqualification. This application automates verification, enforces business and compliance rules, and creates an official combined PDF package in strict accordance with the tender specifications.

---

## 🚀 Key Features

### Mandatory Requirements (M1 – M9 Complete)
- **M1 — Requirements Loading & Verification:** Instant parsing and validation of `requirements.json`. Displays procuring entity, bidder, submission deadline, and document specifications sorted strictly by `order`.
- **M2 — Multi-File PDF Upload:** Drag-and-drop batch upload supporting up to 30 PDF files and 50 MB total. Automatically extracts page counts and reads binary ArrayBuffers via the FileReader API.
- **M3 — 1-to-1 Requirement ↔ PDF Matching:** Interactive matching with change and undo capabilities. Prevents duplicate assignment and maintains injective consistency.
- **M4 — Expiry Date Handling:** Interactive date picker for requirements requiring validity tracking (`has_expiry = true`), conditionally shown when matched.
- **M5 — Real-Time Status Engine:** Pure business-logic engine evaluating document readiness after every state mutation:
  - `Missing` *(Mandatory, unmatched &mdash; Blocking)*
  - `Expiry date needed` *(Matched, has_expiry=true, no date &mdash; Blocking)*
  - `Expired` *(Matched, expiry < deadline &mdash; Blocking)*
  - `Not provided` *(Optional, unmatched &mdash; Non-blocking)*
  - `OK` *(Valid match and expiry &ge; deadline &mdash; Non-blocking)*
  - **Same-Day Rule:** Accurately evaluates documents expiring on the exact submission deadline day as valid (`OK`).
- **M6 — SHA-256 Content Duplicate Detection:** Uses native browser Web Crypto API (`crypto.subtle.digest`) to compute binary hashes. Identifies duplicates regardless of filename, marks them with warning badges, and prevents matching identical documents to different requirements.
- **M7 — PDF Package Assembly:**
  - **English Cover Page:** Always generated in English (per competition specifications) with comprehensive tender metadata and the ordered included documents table.
  - **Deterministic Ordering:** Appends matched documents in strict requirements `order` sequence. Optional unmatched documents are omitted.
  - **Global Margin Footers:** Stamps `<tender_id> | Page X of Y` on every page (including cover) at bottom center. Total page count $Y$ is accurately pre-computed.
- **M8 — Direct Download:** Automatically triggers download as `<tender_id>_Package.pdf` with manual re-download capabilities.
- **M9 — Bilingual Interface (EN ↔ BN):** Instant toggle between English and Bengali across all headers, prompts, status badges, buttons, and document names (`title_en` / `title_bn`).

### High-Value Bonus Features (Phase 6)
- **B7 — Safe Bad/Invalid PDF Handling:** Defensive error boundaries capturing corrupted, truncated, or password-protected PDFs (`PasswordException`, `InvalidPDFException`) without application crashes.
- **B6 — Intelligent Auto-Match Suggestions:** Token and substring similarity algorithms analyzing filenames and requirement titles to automatically suggest matches with a single click (`⚡ Auto-Match`).

---

## 🏗️ Technical Architecture

- **Zero-Build Stack:** Vanilla HTML5, modern CSS3 (Custom Properties, Glassmorphism, CSS Grid/Flexbox), and modular JavaScript (ES Modules).
- **Libraries Loaded via CDN:**
  - `pdf.js` (v3.11.174) &mdash; PDF structure parsing and page counting.
  - `pdf-lib` (v1.17.1) &mdash; In-memory PDF document creation, page copying, text rendering, and serialization.
- **State Management:** Central immutable `AppState` store implementing an observable / subscriber pattern with automatic status and duplicate synchronization.
- **Security & Privacy:** 100% client-side execution. No user documents or tender data are ever transmitted to external servers.

---

## 📂 Project Structure

```
├── index.html                   # Semantic HTML5 application entry point
├── css/
│   └── styles.css               # Design system, glassmorphism UI & responsive styles
├── js/
│   ├── app.js                   # Application bootstrapper and event wiring
│   ├── state.js                 # Central state store with reactive subscriber pattern
│   ├── i18n.js                  # Complete English & Bangla translation dictionaries
│   ├── requirementsLoader.js    # JSON validation and sorting
│   ├── fileProcessor.js         # PDF validation, page counting, SHA-256 hashing
│   ├── duplicateDetector.js     # Exact-content duplicate grouping (SHA-256)
│   ├── matcher.js               # 1-to-1 matching and B6 Auto-Match algorithm
│   ├── statusEngine.js          # Pure business logic status engine
│   ├── packageGenerator.js      # pdf-lib cover page, merge, footers & download
│   └── ui/
│       ├── renderer.js          # Master UI render coordinator
│       ├── tenderInfo.js        # Tender metadata cards renderer
│       ├── requirementsList.js  # Sorted requirements table & status badges
│       ├── fileUpload.js        # File upload list, stats, and duplicate badges
│       ├── matchingUI.js        # Interactive selector and expiry inputs
│       └── notifications.js     # Toast notifications
├── output/
│   └── T-2026-0417_Package.pdf  # Generated verified submission package (7 pages)
├── screenshots/
│   ├── cover_page.png           # Rendered English cover page screenshot
│   ├── sample_document_footer.png# Rendered document page with stamped footer
│   └── status_overview.png      # Application status dashboard overview
├── test_data/                   # Automated test fixtures (requirements & sample PDFs)
├── ARCHITECTURE.md              # Architectural design specification document
└── IMPLEMENTATION_PLAN.md       # Implementation blueprint
```

---

## 💻 How to Run Locally

Because the application uses native ES Modules, it should be served via any local HTTP server:

```bash
# Using Python 3:
python -m http.server 8080

# Or using Node.js:
npx serve .
```

Open `http://localhost:8080/index.html` in Google Chrome or any modern browser.

---

## 🧪 Quality Assurance & Verification

All test scenarios were validated with a **100% pass rate (19 / 19 automated QA tests passed)**:
- [x] Valid and invalid `requirements.json` structure parsing.
- [x] Multi-file PDF uploading, page counting, and non-PDF rejection.
- [x] Corrupted and password-protected PDF safety handling (B7).
- [x] SHA-256 binary hashing and duplicate constraint enforcement.
- [x] Auto-match suggestion accuracy (B6).
- [x] Real-time status transitions including the critical same-day expiry edge case.
- [x] Generate button disabling when blocking conditions exist.
- [x] Verified 7-page PDF output package with English cover page, sequential page ordering, and dynamic `<tender_id> | Page X of Y` footers.
- [x] Verified final download filename: `T-2026-0417_Package.pdf`.
- [x] Full English ↔ Bangla language toggle across all UI components.
