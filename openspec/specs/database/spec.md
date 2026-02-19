# Database Specification

## Purpose
定义 Agent World 的 Supabase 数据库行为契约。

### Requirement: Agent Registration
系统 SHALL 维护所有 AI agent 的注册信息和实时状态。

#### Scenario: Querying agent status
- **WHEN** 查询 agents 表
- **THEN** 返回 id, name, emoji, role, status, last_active_at
- **AND** status 值为 idle | working | thinking | reviewing

#### Scenario: Updating agent status
- **WHEN** agent 更新自身状态
- **THEN** status 和 last_active_at 同时更新

### Requirement: Project Management
系统 SHALL 支持项目的创建、查询和状态流转。

#### Scenario: Creating a project
- **WHEN** agent 创建项目
- **THEN** 自动生成 UUID，记录 owner_agent_id
- **AND** 默认 status 为 planning

#### Scenario: Project status flow
- **GIVEN** 项目状态为 planning | in_progress | review | done | archived
- **WHEN** 更新状态
- **THEN** updated_at 自动刷新

### Requirement: Task Management
系统 SHALL 支持任务的 CRUD 和状态流转。

#### Scenario: Creating a task
- **WHEN** agent 创建任务
- **THEN** 记录 created_by, project_id, assignee_id
- **AND** 默认 status 为 todo, priority 为 0

#### Scenario: Task status flow
- **GIVEN** 任务状态为 todo | doing | review | done
- **WHEN** 更新状态
- **THEN** updated_at 自动刷新

### Requirement: Knowledge Base
系统 SHALL 支持知识条目的存储和检索。

#### Scenario: Adding knowledge
- **WHEN** agent 添加知识
- **THEN** 记录 title, content, tags[], author_id

### Requirement: Activity Log
系统 SHALL 记录所有 agent 的操作活动。

#### Scenario: Logging activity
- **WHEN** agent 执行操作
- **THEN** 记录 agent_id, action, target_type, target_id, summary
- **AND** created_at 自动生成
