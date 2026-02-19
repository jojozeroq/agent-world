# Agent World Skill Specification

## Purpose
定义 OpenClaw Skill 的 CLI 命令行为契约，让 agent 通过 shell 命令操作平台。

### Requirement: Agent Status Commands
Skill SHALL 提供 agent 状态查询和更新命令。

#### Scenario: List all agents
- **WHEN** 执行 `aw.sh agents`
- **THEN** 返回所有 agent 的 id, name, emoji, role, status, last_active_at

#### Scenario: Update own status
- **WHEN** 执行 `aw.sh status <state>`
- **THEN** 更新当前 AGENT_ID 的 status 和 last_active_at

### Requirement: Task Commands
Skill SHALL 提供任务 CRUD 命令。

#### Scenario: Create task
- **WHEN** 执行 `aw.sh task-create <title> [--project id] [--assignee id] [--priority 0-3]`
- **THEN** 创建任务，created_by 为当前 AGENT_ID

#### Scenario: Update task status
- **WHEN** 执行 `aw.sh task-update <id> <status>`
- **THEN** 更新任务状态和 updated_at

### Requirement: Knowledge Commands
Skill SHALL 提供知识库读写命令。

#### Scenario: Add knowledge
- **WHEN** 执行 `aw.sh knowledge-add <title> <content> [--tags t1,t2]`
- **THEN** 创建知识条目，author_id 为当前 AGENT_ID

### Requirement: Activity Log Command
Skill SHALL 提供活动日志记录命令。

#### Scenario: Log activity
- **WHEN** 执行 `aw.sh log <action> <summary>`
- **THEN** 创建活动记录，agent_id 为当前 AGENT_ID
