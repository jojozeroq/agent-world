# Agent World 技术调研报告
> 作者：墨渊 / Mo Yuan | 日期：2026-02-18

## 一、数据库 Schema 设计

### 核心表

```sql
-- Agent 注册表
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  emoji TEXT,
  role TEXT,
  status TEXT DEFAULT 'idle',
  current_task_id UUID,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  meta JSONB DEFAULT '{}'
);

-- 项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning',
  owner_agent_id TEXT REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 任务表
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority INT DEFAULT 0,
  assignee_id TEXT REFERENCES agents(id),
  created_by TEXT REFERENCES agents(id),
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 知识库
CREATE TABLE knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  author_id TEXT REFERENCES agents(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 动态流（活动日志）
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT REFERENCES agents(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 表关系
- agents 1:N tasks（一个 agent 可负责多个任务）
- projects 1:N tasks（一个项目包含多个任务）
- agents 1:N knowledge（一个 agent 可贡献多条知识）
- agents 1:N activities（活动日志）

## 二、Three.js 简笔画/线图风格方案

### 核心思路
用 Three.js 的线条渲染（LineBasicMaterial / LineDashedMaterial）+ 后处理实现手绘感。

### 技术要点
- 几何体用 EdgesGeometry 提取边缘线条，不渲染面
- 线条用不均匀粗细模拟手绘（自定义 shader 或 MeshLine 库）
- 颜色方案：白底 + 黑色/深灰线条 + 少量彩色点缀
- Agent 用简笔画小人表示，不同角色不同颜色
- 任务/项目用几何图形（圆、方、三角）表示状态
- 连线表示关系（agent→task, task→project）

### 推荐库
- `three.js` 核心
- `@react-three/fiber` + `@react-three/drei`（如果用 React）
- `meshline` — 可变粗细线条
- `postprocessing` — 后处理效果（素描风格 outline）

### 动画
- Agent 状态变化时有简单的呼吸/弹跳动画
- 新任务创建时线条从中心延伸出去
- Supabase Realtime 推送触发前端动画更新

## 三、Supabase Realtime 实时同步方案

### 架构
- 前端通过 `supabase.channel()` 订阅表变更
- 后端通过 Postgres Changes 监听 INSERT/UPDATE/DELETE
- Agent 状态变更 → Realtime 推送 → Three.js 场景更新

### 订阅策略
```js
// 订阅 agent 状态变化
supabase.channel('agents').on('postgres_changes',
  { event: '*', schema: 'public', table: 'agents' },
  (payload) => updateAgentNode(payload)
).subscribe()

// 订阅任务变化
supabase.channel('tasks').on('postgres_changes',
  { event: '*', schema: 'public', table: 'tasks' },
  (payload) => updateTaskNode(payload)
).subscribe()

// 订阅活动流
supabase.channel('activities').on('postgres_changes',
  { event: 'INSERT', schema: 'public', table: 'activities' },
  (payload) => addActivityAnimation(payload)
).subscribe()
```

### 注意事项
- Realtime 免费版有连接数限制（200 并发）
- 大量数据变更时做节流（throttle），避免前端卡顿
- 断线重连机制

## 四、技术风险与建议

| 风险 | 影响 | 建议 |
|------|------|------|
| fox-code 供应商对 Claude Code 工具调用兼容性差 | Agent 无法通过 CLI 工具自主写文件 | 用 API 直接调用或等供应商修复 |
| Supabase 免费版限制 | 数据库 500MB、Realtime 200 连接 | 初期够用，后续按需升级 |
| Three.js 简笔画风格实现复杂度 | 自定义 shader 开发成本高 | 先用 EdgesGeometry + MeshLine 快速原型 |
| 多 Agent 并发写入冲突 | 数据一致性问题 | 用 Supabase RLS + 乐观锁 |
| 社交媒体 API 限制 | 发布频率受限 | 做队列缓冲，错峰发布 |

### 优先级建议
1. 先搭 Supabase schema + Skill（让 agent 能用起来）
2. 再做 Three.js 前端（可视化）
3. 最后接社交媒体（苏棠运营）
