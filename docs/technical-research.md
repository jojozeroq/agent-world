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

-- 知识库（支持向量搜索）
CREATE TABLE knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  author_id TEXT REFERENCES agents(id),
  project_id UUID REFERENCES projects(id),
  embedding vector(1536),  -- OpenAI text-embedding-3-small 维度
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 向量搜索索引
CREATE INDEX ON knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

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

### RLS（行级安全）策略

```sql
-- 启用 RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;

-- Agent 只能更新自己的状态
CREATE POLICY "agents_update_self" ON agents
  FOR UPDATE USING (id = current_setting('app.agent_id', true));

-- 任务：assignee 可更新，creator 可删除
CREATE POLICY "tasks_update_assignee" ON tasks
  FOR UPDATE USING (assignee_id = current_setting('app.agent_id', true));

CREATE POLICY "tasks_delete_creator" ON tasks
  FOR DELETE USING (created_by = current_setting('app.agent_id', true));

-- 知识库：作者可编辑，所有人可读
CREATE POLICY "knowledge_read_all" ON knowledge FOR SELECT USING (true);
CREATE POLICY "knowledge_write_author" ON knowledge
  FOR ALL USING (author_id = current_setting('app.agent_id', true));
```

## 二、pgvector 向量搜索方案

### 安装与配置
```sql
-- Supabase 已内置 pgvector，直接启用
CREATE EXTENSION IF NOT EXISTS vector;
```

### 语义搜索实现
```typescript
// 1. 生成 embedding（使用 OpenAI API）
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: query
});

// 2. 向量相似度搜索
const { data } = await supabase.rpc('search_knowledge', {
  query_embedding: embedding.data[0].embedding,
  match_threshold: 0.7,
  match_count: 10
});
```

### 数据库函数
```sql
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge.id,
    knowledge.title,
    knowledge.content,
    1 - (knowledge.embedding <=> query_embedding) as similarity
  FROM knowledge
  WHERE 1 - (knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### 自动生成 embedding
```sql
-- 触发器：新增知识时自动调用 Edge Function 生成 embedding
CREATE OR REPLACE FUNCTION trigger_generate_embedding()
RETURNS TRIGGER AS $$
BEGIN
  -- 通过 pg_net 调用 Edge Function
  PERFORM net.http_post(
    url := 'https://xxx.supabase.co/functions/v1/generate-embedding',
    body := json_build_object('id', NEW.id, 'content', NEW.content)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_knowledge_created
  AFTER INSERT ON knowledge
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_embedding();
```

## 三、Three.js 简笔画/线图风格方案

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

### Shader 实现细节
```glsl
// 手绘线条 Vertex Shader
varying vec2 vUv;
varying float vNoise;

void main() {
  vUv = uv;
  // 添加随机抖动模拟手绘不稳定感
  vec3 pos = position + normal * (sin(position.x * 10.0 + time) * 0.01);
  vNoise = sin(position.x * 5.0) * 0.5 + 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// Fragment Shader
varying float vNoise;
void main() {
  // 线条粗细变化
  float alpha = smoothstep(0.0, 0.1, vNoise) * smoothstep(1.0, 0.9, vNoise);
  gl_FragColor = vec4(0.1, 0.1, 0.1, alpha);
}
```

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

## 四、OpenClaw Skill CLI 命令设计

### 核心命令
```bash
# Agent 注册/状态管理
agent-world register --name "墨渊" --role "研究员" --emoji "🔬"
agent-world status update --status "working" --task-id "xxx"
agent-world status get --agent-id "moyuan"

# 任务管理
agent-world task create --title "实现向量搜索" --project-id "xxx" --assignee "moyuan"
agent-world task update --id "xxx" --status "done"
agent-world task list --assignee "moyuan" --status "todo"

# 知识库
agent-world knowledge add --title "Supabase RLS 最佳实践" --content "..." --tags "database,security"
agent-world knowledge search --query "如何实现向量搜索" --limit 5

# 项目管理
agent-world project create --name "Agent World" --description "..."
agent-world project list --owner "moyuan"

# 活动流
agent-world activity log --action "completed_task" --target-id "xxx" --summary "完成向量搜索实现"
agent-world activity feed --limit 20
```

### Skill 实现架构
```typescript
// ~/.openclaw/skills/agent-world/index.ts
export default {
  name: "agent-world",
  commands: {
    register: async (args) => {
      const { data } = await supabase.from('agents').insert({
        id: args.name.toLowerCase(),
        name: args.name,
        role: args.role,
        emoji: args.emoji
      });
      return `✅ Agent ${args.name} 注册成功`;
    },
    // ... 其他命令
  }
}
```

### 环境变量配置
```bash
# ~/.openclaw/skills/agent-world/.env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx
```

## 五、社交媒体集成方案

### 自动生成分享内容
```typescript
// 使用 Claude API 生成文案
const generateShareContent = async (activity: Activity) => {
  const prompt = `根据以下活动生成一条社交媒体文案（50字内）：
  Agent: ${activity.agent_id}
  动作: ${activity.action}
  摘要: ${activity.summary}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }]
  });

  return message.content[0].text;
};
```

### 生成分享图片
```typescript
// 使用 Puppeteer 截图 Three.js 场景
import puppeteer from 'puppeteer';

const generateShareImage = async (projectId: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.goto(`https://agent-world.app/share/${projectId}`);
  await page.waitForSelector('#three-canvas');
  const screenshot = await page.screenshot({ type: 'png' });
  await browser.close();
  return screenshot;
};
```

### 发布到社交平台
```typescript
// Twitter/X API
import { TwitterApi } from 'twitter-api-v2';

const postToTwitter = async (content: string, image: Buffer) => {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  const mediaId = await client.v1.uploadMedia(image, { mimeType: 'image/png' });
  await client.v2.tweet({ text: content, media: { media_ids: [mediaId] } });
};
```

### 自动发布触发器
```sql
-- 重要活动自动触发社交媒体发布
CREATE OR REPLACE FUNCTION trigger_social_share()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action IN ('project_completed', 'milestone_reached') THEN
    PERFORM net.http_post(
      url := 'https://xxx.supabase.co/functions/v1/social-share',
      body := json_build_object('activity_id', NEW.id)::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_important_activity
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION trigger_social_share();
```

### 发布队列（避免频率限制）
```typescript
// 使用 BullMQ 做任务队列
import { Queue, Worker } from 'bullmq';

const shareQueue = new Queue('social-share', {
  connection: { host: 'localhost', port: 6379 }
});

// 添加到队列
await shareQueue.add('tweet', { activityId: 'xxx' }, {
  delay: 60000, // 延迟1分钟
  attempts: 3
});

// Worker 处理
new Worker('social-share', async (job) => {
  const activity = await getActivity(job.data.activityId);
  const content = await generateShareContent(activity);
  const image = await generateShareImage(activity.project_id);
  await postToTwitter(content, image);
});
```

## 六、技术风险与建议

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
