# Code Review for P26-bot-radar / P26 协同水军雷达审查记录

本文件是审查记录（findings-of-record），不是产品说明书。  
每个 finding 标注 **FIXED**（本分支或前序 PR 已修）或 **OPEN**（仍未解决）。  
行号对着当前 HEAD 的 `app.js` / `index.html`。

审查轴：architecture · security · reliability · test coverage · performance · documentation。

---

## Status banner / 状态横幅

| Item | Status |
|---|---|
| Duplicate `id="valNodes"` 滑块失效 | **FIXED**（PR #3 → 本分支保留） |
| 详情关闭按钮 CJK `onclick=「…」` | **FIXED**（PR #3 修引号；本分支改为 `createElement` + `addEventListener`） |
| SPEC/QA/TASKS 描述 Chart.js 雷达图 | **FIXED**（文案对齐力导向图；见 OPEN 残留） |
| README/manifest「介数中心性」 | **FIXED**（改为「全图度数」文案；未实现 Brandes） |
| `filterBots` 用全图度数打标 | **FIXED**（本分支：协同子图度数 `coordDegree`） |
| 暗色模式被内联浅色写死 | **FIXED**（本分支：CSS 变量） |
| `resize` / `includes` O(E) | **FIXED**（本分支：`resize` + `Set`） |
| 边数密度控件 | **OPEN**（标签已标明只读 ×2；无输入控件） |
| ECharts 未钉死 / 无 vendor 回退 | **OPEN — owned by PR #1** |
| SW 离线画不出图 | **OPEN** |
| 自动化测试 | **OPEN** |

本分支刻意不改 `echarts@5` jsDelivr 加载路径，避免与开放中的 PR #1（`fix/classroom-cold-start`：shared vendor + Pages 回退 + QA 课堂冷启动）撞车。

---

## 🔴 CRITICAL

*(No critical issues found / 无 CRITICAL)*

---

## 🟠 HIGH

### 1. [FIXED] Duplicate DOM IDs Preventing Input Interaction
- **Category:** Reliability
- **Was:** `index.html` 两个 `id="valNodes"`；`getElementById` 命中 span，`nodeCount` 永远回落到 60。
- **Now:** `index.html` L36–37：`#valNodes` span + `#paramNodes` range；`app.js` L186 读 `paramNodes.value`；L224 同步 span。

### 2. [FIXED] Broken Detail Panel Close Button
- **Category:** Reliability
- **Was:** `onclick=「…」`（U+300C/U+300D），点击关闭无效。
- **Now:** `app.js` `showDetail`（L128+）用 `replaceChildren` / `textContent` / `addEventListener`；关闭设置 `detailPanel.hidden = true`。

### 3. [FIXED as docs] Spec/QA claimed a different product
- **Category:** Documentation
- **Was:** Chart.js 雷达图、时间戳、极坐标。
- **Now:** SPEC/TASKS/QA 描述力导向图与阈值过滤。QA 不再盖章「暂无已知严重问题」。

### 4. [FIXED as docs] Betweenness claimed, degree implemented
- **Category:** Documentation / Pedagogy
- **Was:** README/manifest「介数中心性」。
- **Now:** 文案为「全图度数」；过滤改用时间子图度数（见 MEDIUM #1 FIXED）。未实现介数中心性——不要在标题里加回去。

---

## 🟡 MEDIUM

### 1. [FIXED] Filter used full-graph degree on any fast edge
- **Category:** Correctness / Pedagogy
- **File:** `app.js` `filterBots`（L71–90）
- **Was:** 全局 degree +「碰到任意一条快边」→ hub 误报。
- **Now:** `coordDegree` 只在 `timeDelta <= thresh` 的边上累加；节点需协同子图度数 ≥ 阈值才命中。全图 `degree` 仅用于节点大小。

### 2. [OPEN] Missing edge-density control
- **Category:** Feature Completeness
- **File:** `index.html` L38；`app.js` L187 `generateNetwork(nodeCount, 2)`
- **Impact:** 密度乘数写死为 2。UI 已标明「只读」，避免假装有滑块。若要可调，另开 PR，勿与 PR #1 加载路径缠在一起。

### 3. [OPEN — PR #1] Unpinned ECharts + no classroom vendor fallback
- **Category:** Reliability / Classroom
- **File:** `app.js` L240 `echarts@5`（移动 major，无 SRI）
- **Impact:** 机房断网 / CDN 失败则图画不出。
- **Ownership:** PR #1 已实现 `../shared/vendor/echarts.min.js` + `yuuqq.github.io/shared` 回退。本分支不重复改这条路径。

### 4. [OPEN] Service Worker cannot offline-render the product
- **Category:** Reliability / Docs honesty
- **File:** `sw.js`
- **Impact:** `CORE_ASSETS` 仍含 `../shared/dark-toggle.js`，页面实际加载 `releases/v2.6/loader.js`（未预缓存）。ECharts 跨域，fetch handler 直接 `return`，离线无图。README 已去掉 Offline_Ready 徽章级宣称；SW 本身未修。

### 5. [FIXED] Dark theme crushed by inline light colors
- **Category:** Accessibility
- **Was:** `#detailPanel` / `#chartContainer` / footer 内联浅色。
- **Now:** `styles.css` 使用 `--detail-bg` / `--panel-soft` / `--nav-*`；`index.html` 改 class。

---

## 🟢 LOW

### 1. [OPEN] No automated tests
- **Impact:** `filterBots` / `generateNetwork` 重构无回归网。教学仓库可接受，但 `coordDegree` 值得至少一组纯函数断言。

### 2. [OPEN] Unseeded `Math.random`
- **File:** `app.js` `generateNetwork`
- **Impact:** 课堂演示不可复现。

### 3. [OPEN] Manifest theme mismatch
- **File:** `manifest.json` `theme_color` `#c7491f` / `background_color` `#f4f0e8` vs `index.html` `theme-color` `#f2f8ff`。

### 4. [FIXED] Performance nits from second-pass
- **Was:** `suspectEdges.includes(e)` 每边 O(E)；无 `resize`。
- **Now:** L98 `Set`；L231–233 `window.resize` → `currentChart.resize()`。

### 5. [OPEN] DX / monorepo coupling
- **File:** `README.md`、`index.html`
- **Impact:** 依赖 `../shared/...`；无 `package.json` / 本地启动说明。PR #1 的绝对 URL 回退是正确方向。

---

## Security / 安全（当前真相）

- **今天不是漏洞：** `node.name` / `indicators` 均为本地合成；无用户可控 HTML。详情面板已改 `textContent`，不再依赖 `innerHTML` 拼接。
- **今天真实风险：** 未钉死的 jsDelivr `echarts@5`（无 SRI）——课堂供应链 / 可用性，归 PR #1。
- **SW cache-first** 会钉住旧 `app.js` 直至 `CACHE_NAME` 变更——OPEN，未在本分支改。
- **隐私：** 指标仅 `localStorage`，无上传。SPEC NFR 满足。

不要为这个静态 demo 引入 sanitizer 库。

---

## Performance / 性能

- 力导向 + ≤120 节点：可接受。
- `Set` 查边：O(1)。
- `resize`：已接。
- CDN 冷启动：仍受 PR #1 路径影响（OPEN）。

---

## Coordination / 协作

| PR | 关系 |
|---|---|
| #2 | 初版 REVIEW.md（已被二审打回） |
| #3 | 修滑块/关闭按钮 + 第一轮文档对齐；REVIEW 仍把已修项写成现行 HIGH |
| #1 `fix/classroom-cold-start` | ECharts vendor 回退、teach-card 折叠、QA 去盖章——**合入顺序应优先或与本分支协调 QA** |
| 本分支 | 纠正 REVIEW 状态；修子图度数 / 暗色 / resize / 详情 DOM；QA/SPEC/README 诚实化；**不碰** ECharts 加载路径 |

---

## Notes / 说明

- 状态栏仍显示「实际水军 N 个」——教学沙盒对照 ground truth，不是探测器保密需求。
- 图例颜色仍是唯一类别编码；canvas 图无完整文本替代。a11y 基线（skip-link、`aria-live`、`for=`）在，不是「完整无障碍」。
