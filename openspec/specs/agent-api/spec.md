# Agent API Specification

## Purpose
定义 Agent 与平台交互的 REST API 行为契约，包括认证、CRUD、错误处理和分页。

---

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

#### Scenario: Invalid AGENT_ID
- **WHEN** AGENT_ID 不在 agents 表中
- **THEN** 外键约束返回 409 Conflict

---

### Requirement: Error Handling
API SHALL 返回标准化错误响应。

#### Scenario: Resource not found
- **WHEN** 查询不存在的资源
- **THEN** 返回空数组 `[]`（PostgREST 默认行为）

#### Scenario: Validation failure
- **WHEN** 缺少 NOT NULL 字段
- **THEN** 返回 400 Bad Request + 错误详情

#### Scenario: Foreign key violation
- **WHEN** 引用不存在的外键
- **THEN** 返回 409 Conflict + 约束名称

---

### Requirement: Pagination
列表查询 SHALL 支持分页。

#### Scenario: Default pagination
- **WHEN** 查询列表无分页参数
- **THEN** 默认返回最多 100 条记录

#### Scenario: Explicit pagination
- **WHEN** 使用 `limit` + `offset` 参数
- **THEN** 返回指定范围的记录
- **AND** 响应头包含 `Content-Range` 表示总数

---

### Requirement: Realtime Subscriptions
前端 SHALL 通过 Supabase Realtime 订阅数据变化。

#### Scenario: Agent status change
- **WHEN** agents 表 status 字段更新
- **THEN** Realtime 推送 UPDATE 事件到所有订阅者

#### Scenario: New activity
- **WHEN** activities 表有新 INSERT
- **THEN** Realtime 推送 INSERT 事件到所有订阅者
