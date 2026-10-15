# P26 Spec - 协同水军雷达（力导向图）

## 1. Summary

- **Project ID**: P26
- **Project Name**: 协同水军雷达
- **Goal**: 模拟并可视化社交网络中协同水军的拓扑结构，通过时间阈值与**协同子图度数**过滤可疑账号
- **User Persona**: 核查员 / 社交媒体记者
- **Not this product**: 手动打分表单、Chart.js 雷达图、介数中心性实现

## 2. Scope

- **In scope**:
  - 模拟网络拓扑生成（合成账号与边）
  - 可视化账号协同结构（ECharts 力导向图）
  - 基于时间阈值与协同子图度数过滤
  - CSV 导出与节点详情面板
- **Out of scope**:
  - 后端代理或服务端逻辑
  - API Key 持久化存储
  - 真实社交平台抓取
  - Brandes 介数中心性（若将来实现，需改 README/manifest 文案）

## 3. UX

- **Core workflow**: 调参数 → 生成网络 → 调阈值过滤 → 点节点看详情 / 导出 CSV
- **Inputs**: 账号数量、时间间隔阈值、协同子图最小度数
- **Outputs**: 力导向图（着色）+ 详情面板 + 状态计数 + CSV
- **Non-inputs（只读）**: 边数（密度固定 ×2，生成后显示）
- **States**: empty (初始) / loading (ECharts 加载) / error (CDN 失败) / success (完成)

## 4. Functional Requirements

1. FR-1: 生成社交网络拓扑（含种植「模拟水军」供教学对照）
2. FR-2: 力导向图可视化展示
3. FR-3: 按时间与协同子图度数过滤，并支持导出
4. FR-4: 详情面板可开可关；控件 ID 唯一

## 5. Non-Functional Requirements

- **Performance**: 核心任务 3 分钟内完成；≤120 节点力导向可交互
- **Accessibility**: 键盘可达主按钮与 range；`aria-live` 状态；勿宣称「完整无障碍」除非 canvas 有文本替代
- **Privacy**: 本地处理优先，不默认上传数据
- **Browser support**: 现代 Chromium (Chrome 110+)
- **Offline**: 不保证离线渲染（依赖跨域 ECharts）；勿标 Offline-ready，除非 SW/vendor 落地

## 6. Dependencies

- **Libraries/CDNs**: ECharts（当前 jsDelivr `echarts@5`；课堂 vendor 回退见 PR #1）
- **Local data**: 无
- **Shared**: `../shared/releases/v2.6/loader.js` 等（monorepo / Pages 布局）

## 7. Risks & Mitigations

- **Risk**: 教学文案与算法名不一致（介数 vs 度数）→ 误导核查员  
  **Mitigation**: 对外文案使用「全图度数 / 协同子图度数」；过滤实现与文案同步
- **Risk**: CDN / 机房网络导致 ECharts 加载失败  
  **Mitigation**: 状态栏可见错误；PR #1 vendor 回退
- **Risk**: 合成数据被当成真实检出结果  
  **Mitigation**: 状态栏明示「实际水军 N 个」为模拟 ground truth

## 8. Acceptance Criteria

- [x] 节点数量可调节且生效
- [x] 基于时间和协同子图度数过滤
- [x] 力导向图渲染
- [x] 详情面板可关闭
- [x] 纯静态页面可部署 GitHub Pages
- [ ] 移动端可用（需实机再签）
- [x] 隐私提示清晰可见（README / 本地处理说明）
- [ ] 课堂断网路径可用（取决于 PR #1）
