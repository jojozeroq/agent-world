# Agent World 分析报告

> 分析人：林昭 + GPT-5.3 Codex | 日期：2026-02-28

## 一、当前 AW 能力清单

### 数据库表（5张）
| 表 | 用途 |
|---|------|
| agents | Agent 注册信息与实时状态 |
| projects | 项目管理 |
| tasks | 任务管理（含分配、优先级、分类） |
| knowledge | 知识库 |
| activities | 活动日志流 |

### aw.sh 命令（22个）
**快捷命令**: start, done, note, task, pick, finish, dashboard
**CRUD**: agents, status, projects, project-create, project-update, tasks, task-create, task-update, task-assign, knowledge, knowledge-add, knowledge-get, activities, my, help

### 缺失项
- supabase/migrations/ 为空 — 数据库 schema 未版本化
- 无任何自动化 hook 或触发器
- 无项目与本地文件系统的同步机制

---

## 二、数据断层根因分析

### 根因 1：纯手动驱动，零自动化
aw.sh 的所有命令都需要 agent **主动调用**。没有任何 hook 在 agent 工作流的关键节点（session 开始/结束、任务完成、文件变更）自动触发数据同步。

### 根因 2：AGENTS.md 协议未强制执行
`openspec/AGENTS.md` 只定义了 OpenSpec 工作流（读 spec → 写代码 → 归档），完全没有提及 AW 平台操作。agent 不知道自己应该在什么时候调用 `aw.sh`。

### 根因 3：项目数据靠手动创建
`project-create` 命令存在，但没有人执行过。money-ideas 等项目只存在于本地文件系统，从未被推送到 AW 后端。没有"扫描本地项目 → 自动注册"的机制。

### 根因 4：Skill 指引不足
`skill/SKILL.md` 只列出了命令用法，没有定义**何时**应该调用这些命令。缺少工作流级别的指引（如"每次 session 开始时执行 `aw.sh start`"）。

### 根因 5：环境变量未全局配置
`SUPABASE_URL` 和 `SUPABASE_SERVICE_KEY` 需要手动 export，子 agent 的 session 中可能未设置，导致 aw.sh 直接报错退出。

---

## 三、优化方案

### P0（立即执行）— 打通数据流

#### 3.1 环境变量全局化
在所有 agent 的 bashrc 或 OpenClaw 环境中预设 SUPABASE_URL、SUPABASE_SERVICE_KEY、AGENT_ID，确保 aw.sh 随时可用。

#### 3.2 更新 AGENTS.md 协议
在每个 agent 的工作协议中强制加入 AW 操作节点：
- session 开始 → `aw.sh start`
- session 结束 → `aw.sh done "摘要"`
- 创建/完成任务 → `aw.sh task` / `aw.sh finish`
- 发现知识 → `aw.sh note`

#### 3.3 同步现有项目到 AW
手动执行一次：把 money-ideas 等已有项目通过 `aw.sh project-create` 注册到后端。

### P1（本周）— 自动化集成

#### 3.4 新增 `aw.sh sync-projects` 命令
扫描本地 `shared/projects/` 目录，自动将未注册的项目推送到 AW 后端。

#### 3.5 新增 `aw.sh sync-tasks` 命令
扫描项目中的 TODO/任务文件，自动同步到 AW 的 tasks 表。

#### 3.6 Hook 集成
在 OpenClaw 的 heartbeat 或 cron 中定期执行同步：
- 每次 heartbeat 检查是否有新项目/任务未同步
- session 开始时自动 `aw.sh start`
- session 结束时自动 `aw.sh done`

### P2（下周）— 深度集成

#### 3.7 数据库 Schema 版本化
把当前 Supabase 的表结构导出为 migration 文件，放入 `supabase/migrations/`，实现可追溯的 schema 管理。

#### 3.8 双向同步
- AW 后端任务变更 → 通过 Realtime 通知 agent
- agent 本地文件变更 → 通过 git hook 或 watcher 推送到 AW

#### 3.9 活动流自动化
agent 的关键操作（git commit、文件创建、PR 提交）自动记录到 activities 表，形成完整的工作轨迹。

---

## 四、执行优先级

| 优先级 | 任务 | 预计耗时 | 影响 |
|--------|------|----------|------|
| P0 | 环境变量全局化 | 10min | 解除 aw.sh 调用阻塞 |
| P0 | 更新 AGENTS.md 协议 | 30min | agent 知道何时调用 AW |
| P0 | 同步现有项目到 AW | 15min | money-ideas 等立即可见 |
| P1 | 新增 sync-projects 命令 | 2h | 自动发现新项目 |
| P1 | 新增 sync-tasks 命令 | 2h | 自动同步任务 |
| P1 | Hook/Heartbeat 集成 | 1h | 定期自动同步 |
| P2 | Schema 版本化 | 1h | 可追溯的数据库管理 |
| P2 | 双向同步 | 4h | 完整的数据闭环 |
| P2 | 活动流自动化 | 3h | 完整工作轨迹 |

---

## 五、新增优化项（2026-03-04）

### 优化 1：Agent 认证机制（P1）
**问题**：当前所有 agent 共用 SERVICE_KEY，无法区分身份和权限。

**方案**：
- 为每个 agent 生成专属 JWT token（包含 agent_id）
- 更新 Supabase RLS 策略，根据 JWT 中的 agent_id 控制权限
- SERVICE_KEY 仅用于管理操作

**详细方案**：见 `docs/auth-optimization.md`

### 优化 2：强制数据同步（已完成）
**问题**：agent 不知道何时推送数据到 AW。

**方案**：
- 所有 agent 的 `AGENTS.md` 已加入强制同步协议
- Session 开始/结束、任务创建/完成、知识记录都必须调用 aw.sh
