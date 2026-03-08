# P26 Spec - 水军/社交机器人特征打分雷达

## 1. Summary

- **Project ID**: P26
- **Project Name**: 水军/社交机器人特征打分雷达
- **Goal**: 手动填写账号行为特征，输出机器人可信度雷达图评分
- **User Persona**: 核查员 / 社交媒体记者

## 2. Scope

- **In scope**:
  - 手动填写账号行为特征
  - 输出机器人可信度雷达图评分
- **Out of scope**:
  - 后端代理或服务端逻辑
  - API Key 持久化存储

## 3. UX

- **Core workflow**: 用户输入 → 前端处理 → 结果展示
- **Inputs**: 账号行为特征评分
- **Outputs**: 雷达图 + 综合评分
- **States**: empty (初始) / loading (处理中) / error (失败) / success (完成)

## 4. Functional Requirements

1. FR-1: 手动填写账号行为特征
2. FR-2: 结果可视化展示
3. FR-3: 错误状态可见提示

## 5. Non-Functional Requirements

- **Performance**: 核心任务 3 分钟内完成
- **Accessibility**: 键盘导航、aria-label、焦点可见、WCAG AA 对比度
- **Privacy**: 本地处理优先，不默认上传数据
- **Browser support**: 现代 Chromium (Chrome 110+)

## 6. Dependencies

- **Libraries/CDNs**: Chart.js (CDN)
- **Local data**: 无

## 7. Risks & Mitigations

- **Risk**: 主观评分标准不统一
- **Mitigation**: 提供标准化评分指南

## 8. Acceptance Criteria

- [ ] 时间戳输入
- [ ] 24h 分布可视化
- [ ] 可疑度评分
- [ ] 纯静态页面可部署 GitHub Pages
- [ ] 移动端可用
- [ ] 隐私提示清晰可见
