# P26 QA

## Environment

- **Browser**: Chrome 120+ / Edge / 课堂机房机
- **OS**: Windows / macOS / Linux
- **Date**: 2026-10-15
- **Path**: 学生冷启动（无 API Key、尽量不上传文件）
- **Branch under test**: `cursor/third-pass-review-fixes-8631`（叠在 PR #3 之上）

## Classroom walkthrough（水军雷达）

对照本地或 GitHub Pages：打开页面 → 必要时收起教材卡 → 调「账号数量」→ 点「生成网络」→ 调时间/度数阈值 →「应用过滤」→ 点节点看详情 →「关闭」→「导出 CSV」。

### 已验证项（本分支手工核对）

- [x] 账号数量滑块可改 `nodeCount`（无重复 `id`）
- [x] 详情面板可打开并可关闭
- [x] 过滤使用时间子图度数（`coordDegree`），不是「全图度数 + 任意快边」
- [x] 暗色主题下详情面板 / 图容器不再是死浅色
- [x] `window.resize` 后图表会 `resize`
- [x] 状态栏 `aria-live`
- [x] range 控件有 `for`/`id` 关联

### 未宣称通过（诚实缺口）

- [ ] 离线 PWA 能渲染力导向图（ECharts 跨域；SW 不缓存）
- [ ] 边数密度可调（固定 ×2，只读显示）
- [ ] ECharts 课堂 vendor / 断网回退（**开放 PR #1 负责**）
- [ ] 自动化单测
- [ ] 完整无障碍（canvas 图、颜色-only 图例）

## Accessibility Checks

- [x] skip-link + 状态 `aria-live`
- [x] 主要 range 有 `for`/`id`
- [ ] 图例不仅依赖颜色（未做纹理/符号区分）
- [ ] 力导向图无完整文本替代（仅有 `role="img"` 标签）

## Privacy Checks

- [x] 无强制上传数据
- [x] 无隐式密钥持久化
- [x] README 标明本地处理

## Known Issues

- **Issue**: ECharts 仍从 jsDelivr `echarts@5` 懒加载，未钉补丁版、无 SRI、无 shared vendor 回退。  
  **Severity**: classroom  
  **Status**: 留给开放 PR #1（`fix/classroom-cold-start`）；本分支刻意不改加载路径以免冲突。

- **Issue**: Service Worker 离线无法画出产品（不预缓存 ECharts；跨域跳过）。  
  **Severity**: medium（文档曾宣称 Offline Ready，本分支已下调 README）  
  **Status**: OPEN

- **Issue**: 边数密度无控件，乘数写死为 2。  
  **Severity**: low  
  **Status**: UI 已标明只读；OPEN 若需可调滑块

- **Issue**: `generateNetwork` 未播种，课堂演示不可复现。  
  **Severity**: low  
  **Status**: OPEN

- **Issue**: 与 PR #1 并行——对方改 `QA.md` / `app.js` 加载 / `index.html` teach-card。合入时需人工 reconcile。  
  **Severity**: process  
  **Status**: 已在 `REVIEW.md` Coordination 节标明

## Sign-Off

- **This pass**: 2026-10-15 第三轮修复自检（文档 + 上述手工项）
- **Not approved as “无严重问题”**: 已知课堂/离线缺口仍在
- **Do not rubber-stamp**: 禁止再写「暂无已知严重问题」+ 三重 Approved
