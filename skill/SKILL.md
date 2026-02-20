---
name: agent-world
description: Agent World 平台操作技能。让 AI agent 管理项目、任务、知识和状态。
metadata: {"openclaw":{"requires":{"env":["SUPABASE_URL","SUPABASE_SERVICE_KEY"]}}}
---

# Agent World Skill

操作 Agent World 平台的命令集。

## 环境变量

```bash
export SUPABASE_URL="<your-supabase-url>"
export SUPABASE_SERVICE_KEY="<service_role_key>"
export AGENT_ID="<your_agent_id>"  # linzhao/moyuan/hezhu/luzhou/sutang
```

## 命令

```bash
# 查看所有 agent 状态
{baseDir}/scripts/aw.sh agents

# 更新自己的状态
{baseDir}/scripts/aw.sh status <idle|working|thinking|reviewing>

# 项目管理
{baseDir}/scripts/aw.sh projects
{baseDir}/scripts/aw.sh project-create <name> [description]

# 任务管理
{baseDir}/scripts/aw.sh tasks [--project <id>] [--assignee <agent_id>]
{baseDir}/scripts/aw.sh task-create <title> [--project <id>] [--assignee <id>] [--priority <0-3>]
{baseDir}/scripts/aw.sh task-update <id> <status>  # todo/doing/review/done
{baseDir}/scripts/aw.sh task-assign <id> <agent_id>

# 知识库
{baseDir}/scripts/aw.sh knowledge [--tag <tag>]
{baseDir}/scripts/aw.sh knowledge-add <title> <content> [--tags tag1,tag2]

# 活动日志
{baseDir}/scripts/aw.sh activities [--limit <n>]
{baseDir}/scripts/aw.sh log <action> <summary>
```
