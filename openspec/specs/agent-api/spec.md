# Agent API Specification

## Purpose
定义 Agent 与平台交互的 REST API 行为契约。

### Requirement: Supabase REST Interface
所有数据操作 SHALL 通过 Supabase REST API（PostgREST）进行。

#### Scenario: Authentication
- **WHEN** agent 发起 API 请求
- **THEN** 使用 service_role key 通过 apikey + Authorization header 认证

#### Scenario: CRUD operations
- **WHEN** agent 执行数据操作
- **THEN** 使用标准 PostgREST 语法（GET/POST/PATCH/DELETE）
- **AND** 返回 JSON 格式数据

### Requirement: Agent Identity
每个 agent SHALL 通过 AGENT_ID 环境变量标识自身。

#### Scenario: Self-referencing operations
- **WHEN** agent 更新状态或创建内容
- **THEN** 使用 AGENT_ID 作为 agent_id / created_by / author_id
