# Code Review for P26-bot-radar

This document summarizes the findings from a thorough code review of the `Yuuqq/P26-bot-radar` repository. The findings are categorized by severity and evaluate the codebase across six core goals: architecture, security, reliability, test coverage, performance, and documentation.

---

## 🔴 CRITICAL

*(No critical issues found)*

---

## 🟠 HIGH

### 1. Duplicate DOM IDs Preventing Input Interaction
- **Category:** Reliability / Edge Cases
- **File:** `index.html` (Lines 36-37) and `app.js` (Line 136)
- **Impact:** The HTML contains two elements with `id="valNodes"` (a `span` and an `input type="range"`). `document.getElementById("valNodes")` reliably returns the first element in the DOM tree, which is the `span`. Consequently, `valNodes.value` in `app.js` is `undefined`, and `parseInt` returns `NaN`, causing `nodeCount` to unconditionally fallback to `60`. The slider for "账号数量" is completely broken and users cannot adjust the node count.

### 2. Broken Detail Panel Close Button
- **Category:** Reliability
- **File:** `app.js` (Line 131)
- **Impact:** The `showDetail` function generates a close button with invalid syntax `onclick=「...」`, which causes a syntax error when clicked, making the detail panel impossible to close.

### 3. Implementation and Specs Mismatch (Chart.js vs ECharts)
- **Category:** Documentation
- **File:** `SPEC.md`, `QA.md`, `TASKS.md`
- **Impact:** Documentation files describe a "Chart.js 雷达图" (radar chart) and timestamp inputs, but the actual implementation uses "ECharts 力导向图" (force-directed graph).

### 4. Implementation and Docs Mismatch (Centrality vs Degree)
- **Category:** Documentation
- **File:** `README.md`, `manifest.json`
- **Impact:** Documentation claims to use "介数中心性" (Betweenness Centrality), but the code implementation only calculates the full graph degree (全图度数).

---

## 🟡 MEDIUM

### 1. Missing Edge Density Controls
- **Category:** Feature Completeness
- **File:** `index.html`, `app.js`
- **Impact:** The UI implies control over edge density, but there are no actual controls implemented for it, and filtering uses full graph degree.

### 2. Unpinned ECharts Version
- **Category:** Reliability
- **File:** `app.js` (Line 182)
- **Impact:** The script dynamically loads `echarts@5` from jsdelivr without pinning a specific patch/minor version, risking unexpected breakages if ECharts introduces a breaking change in v5.

### 3. Unaddressed Parallel PR #1
- **Category:** Collaboration
- **Impact:** The changes made here do not account for or mention the ongoing work in parallel PR #1, risking merge conflicts or redundant work.

---

## 🟢 LOW

### 1. Developer Experience & Missing Documentation
- **Category:** Documentation
- **File:** `README.md`
- **Impact:** The repository lacks a `package.json` and local setup instructions. The references to `../shared/...` in `index.html` imply this project must be nested inside a specific mono-repo structure (`journalism-toolbox`) to function properly with local CSS/JS.
