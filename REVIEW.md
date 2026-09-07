# Code Review for P26-bot-radar

This document summarizes the findings from a thorough code review of the `Yuuqq/P26-bot-radar` repository. The findings are categorized by severity and evaluate the codebase across six core goals: architecture, security, reliability, test coverage, performance, and documentation.

---

## 🔴 CRITICAL

*(No critical issues found)*

---

## 🟠 HIGH

### 1. Duplicate DOM IDs Preventing Input Interaction
- **Category:** Reliability / Edge Cases
- **File:** `index.html` (Lines 35-36) and `app.js` (Line 125)
- **Impact:** The HTML contains two elements with `id="valNodes"` (a `span` and an `input type="range"`). `document.getElementById("valNodes")` reliably returns the first element in the DOM tree, which is the `span`. Consequently, `valNodes.value` in `app.js` is `undefined`, and `parseInt` returns `NaN`, causing `nodeCount` to unconditionally fallback to `60`. The slider for "账号数量" is completely broken and users cannot adjust the node count.
- **Fix Suggestion:**
  Rename the `id` of the `input` element to something distinct (e.g., `id="paramNodes"`). Update the HTML and `app.js`:
  ```javascript
  // app.js
  const paramNodes = document.getElementById("paramNodes");
  const nodeCount = Math.min(120, Math.max(20, parseInt(paramNodes && paramNodes.value) || 60));
  ```
  ```html
  <!-- index.html -->
  <label>账号数量：<span id="valNodes">60</span></label>
  <input type="range" id="paramNodes" min="20" max="120" value="60"/>
  ```
  *(Note: A similar update mechanism is needed so the `span` updates when the slider moves, like you have for `paramTime`)*.

---

## 🟡 MEDIUM

### 1. XSS Vulnerability via `.innerHTML` Assignment
- **Category:** Security (Injection)
- **File:** `app.js` (Line 115)
- **Impact:** The `showDetail` function assigns raw strings constructed with variables (`node.name`, `node.indicators.join`) directly to `detailPanel.innerHTML`. While currently `node.name` is generated locally and safely (`"🤖 U001"`), if this codebase is ever connected to a real API returning user-generated names or indicators, this becomes a high-severity Cross-Site Scripting (XSS) vulnerability.
- **Fix Suggestion:**
  Prefer building the DOM securely using `document.createElement` and `textContent`, or use a minimal sanitization function before injecting strings into `.innerHTML`.

### 2. Missing CSV Data Escaping
- **Category:** Reliability / Security (Injection)
- **File:** `app.js` (Lines 150-155)
- **Impact:** The `exportCsv` function simply joins array elements with commas `join(",")` and rows with `\n`. If any node names or indicators ever contain commas, newlines, or quotes, the CSV structure will break. Additionally, if values start with `=`, `+`, `-`, or `@`, it could lead to CSV Injection in spreadsheet programs.
- **Fix Suggestion:**
  Implement a robust CSV serialization function that quotes fields containing special characters and prepends a single quote `'` for cells starting with formula prefixes.

---

## 🟢 LOW

### 1. External Script Loading Without Subresource Integrity (SRI)
- **Category:** Security
- **File:** `app.js` (Line 164)
- **Impact:** The app dynamically loads `echarts.min.js` from `cdn.jsdelivr.net`. If the CDN is compromised, malicious code could execute in the context of the user's browser.
- **Fix Suggestion:**
  Add an `integrity` attribute with the appropriate SHA hash and `crossorigin="anonymous"` when creating the script tag.

### 2. Monolithic Architecture & Global Variables
- **Category:** Architecture / Maintainability
- **File:** `app.js`
- **Impact:** `app.js` combines DOM manipulation, state management (`lastData`, `currentChart`), ECharts rendering, and algorithm logic (`generateNetwork`, `filterBots`). This makes the file harder to read, maintain, and unit-test independently.
- **Fix Suggestion:**
  Extract `generateNetwork` and `filterBots` into a separate file or module (e.g., `bot-logic.js`). Encapsulate state inside a class or closure.

### 3. Lack of Automated Test Coverage
- **Category:** Test Coverage
- **File:** Entire Repository
- **Impact:** There are no unit tests. If the heuristic logic in `filterBots` or the random generation logic in `generateNetwork` is refactored, there's no automated way to catch regressions.
- **Fix Suggestion:**
  Introduce a lightweight test runner (e.g., Jest or Vitest) and write tests asserting that `filterBots` correctly identifies nodes exceeding the `degreeThresh` for edges under `timeThresh`.

### 4. Developer Experience & Missing Documentation
- **Category:** Documentation
- **File:** `README.md`
- **Impact:** The repository lacks a `package.json` (for managing local tooling, linting, formatting) and local setup instructions. The references to `../shared/...` in `index.html` imply this project must be nested inside a specific mono-repo structure (`journalism-toolbox`) to function properly with local CSS/JS.
- **Fix Suggestion:**
  Document the required directory structure in `README.md` or bundle shared assets. Add instructions on how to start a local server (e.g., `npx serve .` or `python3 -m http.server`).

---

## 💡 Notes on Solid Areas
- **Service Worker Strategy:** `sw.js` uses a clean and appropriate stale-while-revalidate / cache-first approach for offline capabilities.
- **Metrics Tracking:** `pm-metrics.js` provides comprehensive and robust client-side telemetry handling local storage elegantly.
- **Accessibility:** `index.html` includes proper `aria-live`, `role="status"`, and skip links for screen readers, providing a strong baseline for inclusive design.
