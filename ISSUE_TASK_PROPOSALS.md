# Issue Triage: Proposed Fix Tasks

## 1) Typo Fix Task
**Task:** Fix the typo `README.` in the repository root by renaming it to a valid markdown filename (e.g., `README.md` or `README.legacy.md`) and update any references.

**Why:** A trailing dot filename is likely accidental and can break cross-platform tooling (especially on Windows) and docs discovery.

**Evidence:** root file list contains `README.`.

---

## 2) Bug Fix Task
**Task:** In `omni-portal/portal.js`, replace the "Enter ScrollVerse" navigation target from `../README.md` to a real HTML route (for example `/index.html` or a portal landing page).

**Why:** Browsers do not render markdown as an application page by default; users clicking the button can end up on a raw file or 404 depending on hosting configuration.

**Evidence:** click handler explicitly sets `window.location.href = '../README.md';`.

---

## 3) Documentation Discrepancy Task
**Task:** Reconcile test commands in `TESTING_GUIDE.md` with actual scripts in `package.json`.

**Why:** The guide lists commands like `npm run test:unit`, `npm run test:coverage`, and `npm run test:watch`, but these scripts are not defined in `package.json`, which causes command failures for contributors.

**Evidence:** commands documented in `TESTING_GUIDE.md`; only `test` and selected specific scripts exist in `package.json`.

---

## 4) Test Improvement Task
**Task:** Add negative-path tests for malformed `X-Hub-Signature-256` headers in `tests/test_webhook_signature.py` (for example, missing `sha256=` prefix + non-hex digest + mixed-case prefix handling).

**Why:** Current tests cover missing header and invalid format broadly, but do not fully enforce header parsing constraints and edge-cases that commonly appear in webhook abuse attempts.

**Evidence:** existing coverage has `test_invalid_signature_format` and `test_missing_signature_header`, but no test for non-hex digest or prefix casing behavior.
