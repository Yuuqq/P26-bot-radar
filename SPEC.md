# P26 Spec - 水军/社交机器人特征打分雷达

## 1. Summary

- **Project ID**: P26
- **Project Name**: 协同水军雷达
- **Goal**: 模拟并可视化社交网络中协同水军的拓扑结构，通过时间阈值与度中心性过滤可疑账号
- **User Persona**: 核查员 / 社交媒体记者

## 2. Scope

- **In scope**:
  - 模拟网络拓扑生成
  - 可视化账号协同结构
  - 基于时间和度中心性过滤
- **Out of scope**:
  - 后端代理或服务端逻辑
  - API Key 持久化存储

## 3. UX

- **Core workflow**: 用户输入 → 前端处理 → 结果展示
- **Inputs**: 账号数量、过滤时间与度数阈值
- **Outputs**: 力导向图 + 疑似水军列表
- **States**: empty (初始) / loading (处理中) / error (失败) / success (完成)

## 4. Functional Requirements

1. FR-1: 生成社交网络拓扑
2. FR-2: 结果可视化展示
3. FR-3: 根据参数过滤水军并导出

## 5. Non-Functional Requirements

- **Performance**: 核心任务 3 分钟内完成
- **Accessibility**: 键盘导航、aria-label、焦点可见、WCAG AA 对比度
- **Privacy**: 本地处理优先，不默认上传数据
- **Browser support**: 现代 Chromium (Chrome 110+)

## 6. Dependencies

- **Libraries/CDNs**: ECharts (CDN)
- **Local data**: 无

## 7. Risks & Mitigations

- **Risk**: 主观评分标准不统一
- **Mitigation**: 提供标准化评分指南

## 8. Acceptance Criteria

- [ ] 节点数量调节
- [ ] 基于度和时间过滤
- [ ] 力导向图渲染
- [ ] 纯静态页面可部署 GitHub Pages
- [ ] 移动端可用
- [ ] 隐私提示清晰可见
