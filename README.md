# P26 协同水军雷达：图论网络拓扑与全图度数

> 基于网络科学(Network Science)的教学演示：合成协同发帖网络，用力导向图展示，并按时间阈值与协同子图度数过滤可疑账号。

[![Live Demo](https://img.shields.io/badge/Live-Demo-c7491f?style=for-the-badge)](https://yuuqq.github.io/P26-bot-radar/)
[![PWA](https://img.shields.io/badge/PWA-Installable-94a3b8?style=for-the-badge)](#)

**不是介数中心性实现。** 过滤指标是时间窗口内的协同子图度数；节点大小仍参考全图度数。

## 🚀 在线体验

**[https://yuuqq.github.io/P26-bot-radar/](https://yuuqq.github.io/P26-bot-radar/)**

可安装为 PWA。离线**不保证**能渲染力导向图（ECharts 目前走跨域 CDN，见 `REVIEW.md` / 开放 PR #1）。

## ✨ 功能特性

- 🌗 暗色/亮色模式（详情面板与图容器跟随主题变量）
- 🔍 `Ctrl+K` 跨工具搜索跳转（shared loader）
- 📱 PWA 可安装；核心静态资源可缓存（可视化库另计）
- ♿ skip-link、`aria-live`、range `for`/`id`（canvas 图无完整文本替代）
- 🔒 所有数据仅在浏览器本地处理

## 🛠️ 技术栈

- 纯 HTML + CSS + JavaScript（零依赖框架）
- ECharts 力导向图（CDN；课堂 vendor 见 PR #1）
- CSS 变量设计令牌系统
- Service Worker 缓存策略（见已知限制）

## 📦 共享模块

- `design-tokens.css` — 统一设计令牌与暗色模式
- `dark-toggle.js` / `releases/v2.6/loader.js` — 主题与工具箱模块
- `cmd-palette.js` — 🔍 Ctrl+K 命令面板
- `toast.js` — 🔔 Toast 通知系统
- `onboarding.js` — 🎯 首次访问引导
- `sw.js` — 📱 PWA Service Worker
- `pm-metrics.js` — 📊 本地使用量遥测

## 📄 文档

- `SPEC.md` — 范围与验收
- `QA.md` — 课堂路径与已知问题（不盖章）
- `REVIEW.md` — 审查记录（FIXED / OPEN）
- `TASKS.md` — 任务勾选

## 📄 许可

本项目为新闻素养教学工具，仅供学习与研究使用。

---

*本项目是 [新闻素养工具箱](https://yuuqq.github.io/journalism-toolbox/) 的第 26 号工具。*
