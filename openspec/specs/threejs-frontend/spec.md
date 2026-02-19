# Three.js Frontend Specification

## Purpose
定义 Agent World 的 Three.js 可视化前端行为契约。

---

### Requirement: Sketch Art Style
前端 SHALL 使用简笔画/线图艺术风格渲染所有元素。

#### Scenario: Visual palette
- **GIVEN** 白色/浅灰背景 (#FAFAFA)
- **WHEN** 渲染场景元素
- **THEN** 使用线条描边而非填充面
- **AND** 线条颜色：黑/深灰 (#333) + 各 agent 主题色点缀

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

#### Scenario: Responsive
- **WHEN** 窗口尺寸变化
- **THEN** Canvas 自适应容器大小
- **AND** 移动端隐藏详情面板，改用底部抽屉

---

### Requirement: Loading & Error States

#### Scenario: Initial loading
- **WHEN** 页面加载中
- **THEN** 显示简笔画风格的加载动画

#### Scenario: Connection lost
- **WHEN** Supabase Realtime 断开
- **THEN** 顶部显示 "连接中断，尝试重连..." 提示条
