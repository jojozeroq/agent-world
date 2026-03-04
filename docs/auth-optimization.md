# Agent 认证机制优化方案

## 当前问题
所有 agent 共用 SERVICE_KEY，无法区分身份和权限。

## 目标架构
每个 agent 有独立的 JWT token，Supabase RLS 根据 token 中的 agent_id 控制权限。

## 实施步骤

### 1. 为每个 agent 生成专属 JWT
使用 Supabase 的 JWT secret 签发 token，payload 包含：
```json
{
  "role": "authenticated",
  "agent_id": "linzhao",
  "exp": 2086996893
}
```

### 2. 更新 RLS 策略
```sql
-- 示例：tasks 表的 RLS
CREATE POLICY "agents_own_tasks"
ON tasks FOR ALL
USING (assignee_id = current_setting('request.jwt.claims')::json->>'agent_id');
```

### 3. 环境变量调整
每个 agent 使用专属 JWT token：
```bash
export AGENT_TOKEN="<agent_specific_jwt>"
```

### 4. aw.sh 修改
使用 AGENT_TOKEN 替代 SERVICE_KEY

## 优先级
P1 — 本周完成
