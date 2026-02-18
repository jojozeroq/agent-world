# Agent World 项目计划
> 作者：陆舟 / Lu Zhou | 日期：2026-02-18

## 一、里程碑

| 阶段 | 目标 | 预计周期 |
|------|------|----------|
| M0 | 基础设施搭建（Supabase + Git + 共享目录） | 1天 |
| M1 | 后端 Schema + OpenClaw Skill | 2-3天 |
| M2 | Three.js 前端原型（简笔画风格） | 3-5天 |
| M3 | Realtime 联调 + 前后端打通 | 2天 |
| M4 | 社交媒体集成 + 苏棠内容运营 | 持续 |
| M5 | Vercel 部署上线 | 1天 |

## 二、任务拆解

### M0 - 基础设施 ✅ 已完成
- [x] Git 仓库初始化
- [x] 共享知识目录
- [x] 工具安装（Claude Code / Codex / Gemini / CC-Switch）
- [x] Agent 注册与频道路由
- [ ] Supabase 项目创建（等用户提供）

### M1 - 后端 + Skill
- [ ] 创建 Supabase 数据库表（agents/projects/tasks/knowledge/activities）
- [ ] 配置 RLS 策略
- [ ] 编写 agent-world skill（CRUD 命令封装）
- [ ] 安装 skill 到所有 agent 工作区
- [ ] 初始化 agent 数据（5个 agent 注册）

### M2 - Three.js 前端
- [ ] Vite + React + Three.js 项目初始化
- [ ] 简笔画风格渲染器（EdgesGeometry + MeshLine）
- [ ] Agent 节点组件（简笔画小人）
- [ ] 任务/项目节点组件
- [ ] 关系连线
- [ ] 基础交互（悬停、点击查看详情）

### M3 - 联调
- [ ] Supabase Realtime 订阅接入
- [ ] 数据变更 → 场景动画
- [ ] 状态面板 UI

### M4 - 社交媒体
- [ ] 活动流内容生成模板
- [ ] 苏棠发布工作流
- [ ] 定时抓取趣闻动态

### M5 - 部署
- [ ] Vercel 部署前端
- [ ] 域名配置
- [ ] 监控与告警

## 三、团队分工

| Agent | 角色 | 主要职责 |
|-------|------|----------|
| 🌟 林昭 | 统筹 | 架构设计、协调各方、代码审查 |
| 🔬 墨渊 | 调研 | 技术方案、竞品分析、文档 |
| 💻 何筑 | 编码 | 前后端开发、Skill 编写 |
| 📋 陆舟 | 管理 | 任务跟踪、进度推进、风险管控 |
| 🌸 苏棠 | 运营 | 内容创作、社交媒体、用户反馈 |

## 四、风险与应对

| 风险 | 应对 |
|------|------|
| Claude Code/Codex 在 fox-code 下工具调用不兼容 | 林昭直接协调，或用 API 调用替代 |
| Supabase 免费版容量限制 | 控制数据量，必要时升级 |
| Three.js 简笔画风格开发周期不确定 | 先做最小原型，迭代优化 |
| 多 agent 并发写入冲突 | RLS + 乐观锁 |

## 五、当前状态

**阶段：M0 → M1 过渡中**
- 等待 Supabase 项目信息
- 技术调研已完成
- 项目计划已制定
