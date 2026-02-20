# Three.js Frontend Specification

## Purpose
定义 Agent World 的 Three.js 可视化前端行为契约。

---

### Requirement: Dual Art Style (NEW)
前端 SHALL 支持两种艺术风格模式，用户可切换。

#### Scenario: Sketch mode (简笔画模式)
- **GIVEN** 用户选择简笔画模式
- **WHEN** 渲染场景
- **THEN** 白色/浅灰背景 (#FAFAFA)
- **AND** 使用线条描边而非填充面
- **AND** 线条颜色：黑/深灰 (#333) + 各 agent 主题色点缀
- **AND** 整体风格干净、极简

#### Scenario: Color mode (色彩模式)
- **GIVEN** 用户选择色彩模式
- **WHEN** 渲染场景
- **THEN** 柔和渐变背景
- **AND** agent 节点使用主题色填充 + 描边
- **AND** 连接线使用彩色渐变
- **AND** 整体风格温暖、活泼，色彩饱和度适中

#### Scenario: Mode toggle
- **WHEN** 用户点击风格切换按钮
- **THEN** 场景平滑过渡到目标风格（颜色渐变 ~0.5s）
- **AND** 用户偏好存储到 localStorage

---

### Requirement: Sketch Art Style
前端 SHALL 使用简笔画/线图艺术风格渲染所有元素。

#### Scenario: Rendering agents
- **WHEN** 渲染 agent 节点
- **THEN** 使用线条圆形表示头部，每个 agent 有独立主题色
- **AND** 圆形上方显示 emoji + 名称标签
- **AND** 圆形下方显示当前状态文字

#### Scenario: Agent status animation
- **GIVEN** agent 状态为 idle
- **THEN** 节点有缓慢呼吸动画（scale 0.95-1.05）
- **GIVEN** agent 状态为 working
- **THEN** 节点有脉冲发光效果
- **GIVEN** agent 状态为 thinking
- **THEN** 节点上方显示旋转省略号动画
- **GIVEN** agent 的 last_active_at 超过 30 分钟
- **THEN** 节点灰显，透明度降至 0.4

---

### Requirement: Realtime Updates
前端 SHALL 通过 Supabase Realtime 实时反映数据变化。

#### Scenario: Agent status change
- **WHEN** agents 表 status 更新
- **THEN** 对应节点动画平滑过渡到新状态

#### Scenario: New activity
- **WHEN** activities 表有新记录
- **THEN** 在对应 agent 节点旁播放气泡弹出动画
- **AND** 气泡显示活动摘要，3 秒后淡出

---

### Requirement: Interactive Controls

#### Scenario: Camera control
- **WHEN** 用户拖拽/缩放
- **THEN** OrbitControls 响应操作
- **AND** 限制缩放范围 (minDistance: 5, maxDistance: 50)

#### Scenario: Node hover
- **WHEN** 用户悬停 agent 节点
- **THEN** 节点放大 1.2x，显示 tooltip（角色 + 当前任务）

#### Scenario: Node click
- **WHEN** 用户点击 agent 节点
- **THEN** 右侧滑出详情面板，显示该 agent 的任务列表和最近活动

---

### Requirement: Layout

#### Scenario: Agent arrangement
- **WHEN** 场景初始化
- **THEN** 5 个 agent 节点以圆形布局排列
- **AND** agent 之间有虚线连接表示协作关系

#### Scenario: Responsive (UPDATED)
- **WHEN** 窗口宽度 > 1024px (桌面)
- **THEN** 完整布局：Canvas + 右侧详情面板
- **WHEN** 窗口宽度 768-1024px (平板)
- **THEN** Canvas 全屏，详情面板改为浮层
- **WHEN** 窗口宽度 < 768px (手机)
- **THEN** Canvas 全屏，详情面板改为底部抽屉
- **AND** 触摸手势支持（双指缩放、单指旋转）
- **AND** agent 节点点击区域放大以适配触摸

---

### Requirement: Multi-Platform Deployment (NEW)
前端 SHALL 支持在多种静态托管平台部署。

#### Scenario: Static build output
- **WHEN** 执行 `npm run build`
- **THEN** 输出纯静态文件到 `dist/` 目录
- **AND** 不依赖服务端渲染或 Node.js 运行时

#### Scenario: GitHub Pages
- **WHEN** 部署到 GitHub Pages
- **THEN** vite.config.ts 支持配置 `base` 路径
- **AND** 路由使用 hash mode 或单页面（无 server-side routing）

#### Scenario: Deno Deploy
- **WHEN** 部署到 Deno Deploy
- **THEN** 提供静态文件服务脚本 (`serve.ts`)
- **AND** 兼容 Deno 的模块系统

#### Scenario: Generic static hosting
- **WHEN** 部署到任意静态托管（Vercel/Netlify/Cloudflare Pages）
- **THEN** 零配置即可工作
- **AND** 所有 API 调用通过客户端直连 Supabase（无需后端代理）

---

### Requirement: Loading & Error States

#### Scenario: Initial loading
- **WHEN** 页面加载中
- **THEN** 显示简笔画风格的加载动画

#### Scenario: Connection lost
- **WHEN** Supabase Realtime 断开
- **THEN** 顶部显示 "连接中断，尝试重连..." 提示条
