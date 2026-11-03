# MergeFlow — Secure In-Browser PDF Merger Console

> A privacy-centric, zero-server-leak PDF manipulation application built with React 19, TypeScript, Tailwind CSS, and `pdf-lib`. Designed for instant client-side merging and ready for scalable, secure deployment to **Google Cloud Run**.

---

## Table of Contents
1. [Overview & Core Value](#overview--core-value)
2. [Architectural Highlights](#architectural-highlights)
3. [Agentic Threat Model (The 5 Threat Zones)](#agentic-threat-model-the-5-threat-zones)
4. [OWASP Top 10 & LLM Security Compliance](#owasp-top-10--llm-security-compliance)
5. [Functional Stability & Comprehensive Test Walkthrough](#functional-stability--comprehensive-test-walkthrough)
6. [Project Structure](#project-structure)
7. [License](#license)

---

## Overview & Core Value

**MergeFlow** is an enterprise-grade, browser-native PDF merging suite that prioritizes data privacy and document integrity:
- **No API Keys Required for Core Operations**: The entire PDF merging and page inspection engine runs **100% client-side in the browser** via `pdf-lib`. No Gemini API key, server uploads, or third-party accounts are needed to merge documents.
- **Zero Server Uploads**: PDF parsing, page indexing, and merging take place entirely in the client-side JavaScript memory sandbox. Sensitive documents never leave the user's browser.
- **Granular Document Controls**: Drag-and-drop ingestion, interactive reordering (Move Up / Down), automatic sorting by name or size, per-file page-count detection, and password-protected PDF quarantine.
- **Custom Output Metadata**: Customizable output document names, live file size and page count aggregations, and instant one-click Blob downloads.
- **Dark/Light Mode**: Full responsive design supporting automatic system color schemes and manual toggle.
- **Cloud Run & Future-Ready**: Ready to deploy serverlessly to Google Cloud Run with optional Google Cloud Secret Manager bindings if you ever choose to add AI features (like smart document tagging).

---

## Architectural Highlights

- **Frontend Runtime**: React 19, TypeScript 5.8, Tailwind CSS v4, Lucide React icons, Motion animations.
- **Client Sandboxed PDF Engine**: `pdf-lib` v1.17 for streaming `ArrayBuffer` manipulation without transmitting binary payloads over the network.
- **Build System**: Vite 6.2 with lightning-fast HMR and tree-shaken production bundles.
- **Hosting Target**: Google Cloud Run with Google Cloud Buildpacks / Docker, fronted by HTTPS and IAM authentication.

---

## Agentic Threat Model (The 5 Threat Zones)

Prior to designing and implementing features, MergeFlow conducts structured threat modeling across all five agentic attack zones:

| Threat Zone | Identified Attack Vector / Vulnerability | Severity | Mitigation & Countermeasure |
| :--- | :--- | :--- | :--- |
| **1. Input Surfaces** | Malformed, oversized, or malicious PDF exploits (e.g., zip bombs, buffer overflow attempts, embedded executable scripts). | High | In-browser file validation via MIME types (`application/pdf`), explicit error boundaries in `pdf-lib.load()`, and immediate quarantine of password-protected or unparseable files without crashing the UI. |
| **2. Planning & Reasoning** | Prompt injection or system instruction hijacking if document metadata or names are forwarded to LLM endpoints. | High | Strict delimitation and schema-enforced JSON validation using `@google/genai`; untrusted inputs treated strictly as literal data objects, never executable instructions. |
| **3. Tool Execution** | Dynamic code execution, SSRF, or privilege escalation via server endpoints. | Critical | No server-side shell or eval execution. All PDF operations run inside the client sandbox. Backend APIs strictly parameterize inputs and bind to least-privilege IAM roles. |
| **4. Memory & State** | Cross-user data leakage, unauthenticated document state tampering in database, or session hijacking. | High | Owner-bound path enforcement in Firestore security rules (`request.auth.uid == userId`). No plaintext credentials stored; ephemeral in-memory state garbage collected upon merge reset. |
| **5. Inter-System Communication**| API key exposure, hardcoded tokens in source code, or unauthorized interception of external service calls. | Critical | Zero-hardcoding hygiene. All API credentials retrieved dynamically from Google Cloud Secret Manager. No client-exposed Gemini API secrets. |

---

## OWASP Top 10 & LLM Security Compliance

MergeFlow adheres to the following security standards:

1. **Input Validation & Sanitization (OWASP A03 / LLM02)**:
   - Filenames and metadata are sanitized before rendering or saving.
   - Upload queues enforce MIME validation (`application/pdf`) and isolate files that fail byte header parsing.
2. **Indirect Prompt Injection Defense (OWASP LLM01)**:
   - Any future AI-assisted document classification or summarization processes untrusted content through parameter-bound Gemini schemas with isolated system instructions.
3. **Broken Access Control Mitigation (OWASP A01)**:
   - Context-bound permission checks at every API and Firestore boundary.
   - User interaction logs are segregated by unique authentication identifiers.
4. **Output Handling & Sanitization (OWASP A03 / LLM05)**:
   - All document stats, filenames, and error messages are encoded before injection into React virtual DOM nodes, eliminating XSS.
5. **Zero-Crash Payload Hygiene**:
   - Any database payloads are cleansed of `undefined` values before persistence.

---


## Functional Stability & Comprehensive Test Walkthrough

This section provides an exhaustive, step-by-step test matrix of all user flows and interactive features. Another coding agent or automated QA suite (e.g., Playwright/Cypress) can turn these cases into executable scripts.

### Test Suite 1: File Ingestion & Drag-and-Drop
- **Test Case 1.1: Single File Dropzone Upload**
  - **Action**: Drag a valid sample PDF (`doc1.pdf`, 2 pages) onto the empty state Dropzone.
  - **Expected Result**: Dropzone transitions to active Upload Queue; file appears in list with correct title, size formatted in KB/MB, and page counter shows "2 pages".
- **Test Case 1.2: Multi-File Batch Ingestion**
  - **Action**: Click "Browse Files" and select 3 valid PDFs (`a.pdf`, `b.pdf`, `c.pdf`).
  - **Expected Result**: All 3 files populate the queue in order. The summary panel displays "3 files selected", aggregate page count, and combined byte size.
- **Test Case 1.3: Incremental File Appending**
  - **Action**: With 2 files currently in queue, click the "+ Add Files" button or bottom dashed append container and choose `extra.pdf`.
  - **Expected Result**: `extra.pdf` is appended to the bottom (index 3) without resetting the existing items.

### Test Suite 2: Document Validation & Error Quarantine
- **Test Case 2.1: Password-Protected / Encrypted PDF Handling**
  - **Action**: Upload a password-encrypted PDF.
  - **Expected Result**: The item renders an inline warning badge: "This PDF is encrypted or password-protected and cannot be processed." The main "Merge Documents" button is disabled.
- **Test Case 2.2: Malformed or Corrupted File Upload**
  - **Action**: Upload a non-PDF file renamed with a `.pdf` extension.
  - **Expected Result**: The item flags an inline error: "Failed to parse this file. Please verify it is a valid PDF."
- **Test Case 2.3: Error Block Guard on Merge Action**
  - **Action**: Attempt to trigger merge while an errored file remains in the queue.
  - **Expected Result**: Global error banner displays "Please remove files loaded with errors before merging" and compilation is halted.
- **Test Case 2.4: Removal of Errored File Restores Readiness**
  - **Action**: Click the trash icon on the errored item.
  - **Expected Result**: Errored item is removed from queue, global error clears, and the "Merge Documents" button returns to active state.

### Test Suite 3: Queue Reordering & Sorting
- **Test Case 3.1: Manual Reordering via Move Up / Move Down**
  - **Action**: In a 3-file queue (`File A`, `File B`, `File C`), click the "Move Down" arrow on `File A`.
  - **Expected Result**: Queue order updates to `File B`, `File A`, `File C`. Top item's "Move Up" button is disabled; bottom item's "Move Down" button is disabled.
- **Test Case 3.2: Alphabetic Sorting (A-Z)**
  - **Action**: In a queue with `Zebra.pdf`, `Alpha.pdf`, `Beta.pdf`, click "Sort A-Z" in Output Config.
  - **Expected Result**: Queue re-sorts instantaneously to `Alpha.pdf`, `Beta.pdf`, `Zebra.pdf`.
- **Test Case 3.3: Size Sorting (Largest First)**
  - **Action**: In a queue with `Small.pdf` (50 KB), `Large.pdf` (5 MB), `Medium.pdf` (1 MB), click "Sort by Size".
  - **Expected Result**: Queue arranges items in descending file size order (`Large.pdf`, `Medium.pdf`, `Small.pdf`).

### Test Suite 4: Configuration & Merge Compilation
- **Test Case 4.1: Custom Output Filename Sanitization**
  - **Action**: Click the output filename input field and enter `Q4-Financial-Report`.
  - **Expected Result**: Input value persists and preview suffix indicates `.pdf`.
- **Test Case 4.2: In-Memory Merge Execution**
  - **Action**: With 3 valid PDFs loaded, click "Merge 3 Documents".
  - **Expected Result**: Loading state activates ("Compiling PDF..."), spinner animates, UI locks against accidental double-clicks.
- **Test Case 4.3: Success Screen Dashboard**
  - **Action**: Wait for merge promise to resolve (typically < 1000ms).
  - **Expected Result**: Workspace transitions to `MergeSuccess` view displaying:
    - Target file name (`Q4-Financial-Report.pdf`)
    - Total combined page count badge
    - Total output size badge
    - "Download Merged PDF" primary button
    - "Merge More Files" secondary action

### Test Suite 5: Output Download & Lifecycle Reset
- **Test Case 5.1: Instant Blob Download Trigger**
  - **Action**: Click "Download Merged PDF".
  - **Expected Result**: Browser prompts file save / downloads `Q4-Financial-Report.pdf` with valid binary content matching the expected combined page count.
- **Test Case 5.2: Workspace Reset**
  - **Action**: Click "Merge More Files".
  - **Expected Result**: In-memory PDF bytes are dereferenced and garbage collected; queue is cleared; interface returns to empty Dropzone state.

### Test Suite 6: Dark Mode & Accessibility
- **Test Case 6.1: Theme Toggle**
  - **Action**: Click the sun/moon theme icon in the header.
  - **Expected Result**: The HTML root toggles the `dark` class, background switches from `bg-slate-50` to `bg-[#090d16]`, card borders and text contrast adapt seamlessly without contrast degradation.

---

## Project Structure

```text
├── .env.example              # Environment variables template
├── firestore.rules           # Cloud Firestore security rules
├── index.html                # Entrypoint HTML with responsive viewport
├── metadata.json             # Applet capability definitions
├── package.json              # NPM dependencies and build scripts
├── src/
│   ├── App.tsx               # Core workspace, state management, and orchestration
│   ├── components/
│   │   ├── Dropzone.tsx      # Drag-and-drop & native file picker surface
│   │   ├── MergeControls.tsx # Output naming, sorting tools, and merge triggers
│   │   ├── MergeSuccess.tsx  # Download dashboard with file statistics
│   │   └── PDFListItem.tsx   # File card with reorder controls and error badges
│   ├── index.css             # Tailwind CSS imports and dark theme rules
│   ├── main.tsx              # React DOM mounting
│   ├── types.ts              # TypeScript interfaces for PDF files & themes
│   └── utils/
│       ├── fileSize.ts       # Byte-to-human-readable size formatting helper
│       └── pdfHelper.ts      # Client-side pdf-lib integration and page parser
├── tsconfig.json             # TypeScript compiler settings
└── vite.config.ts            # Vite build configuration with Tailwind plugin
```

---

## License

This project is licensed under the [MIT License](LICENSE).
