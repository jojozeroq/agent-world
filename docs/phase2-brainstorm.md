# Phase 2 多专家头脑风暴

**日期**: 2026-02-22
**目标**:
1. 强制/引导 AI agent 自动增查改平台资源（项目/任务/知识/活动）
2. 用极具艺术性的方式展示这些资源（蓝图/游戏风格）

---

## 🏗️ 系统架构师 — 独立发言

### 观点
Hook 机制是关键。OpenClaw 支持 hook 在特定事件触发时执行脚本，我们需要在 agent 生命周期的关键节点插入自动化行为。

### 具体方案

**1. Hook 集成点**
```yaml
# ~/.claude/hooks.yaml (每个 agent 配置)
on_session_start:
  - aw.sh status working
  - aw.sh log session_start "开始新会话"

on_task_complete:
  - aw.sh log task_done "$TASK_SUMMARY"

on_file_write:
  - aw.sh log code_change "修改了 $FILE_PATH"
```

**2. AGENTS.md 强制规范**
在 `openspec/AGENTS.md` 添加强制步骤：
- 每日首次工作：`aw.sh status working` + 查看 `aw.sh tasks --assignee $AGENT_ID`
- 创建新功能：必须 `aw.sh project-create` 或关联现有项目
- 完成任务：必须 `aw.sh task-update <id> done`
- 发现知识：必须 `aw.sh knowledge-add`

**3. Skill 自动化包装**
创建 `agent-world` skill，包装常用操作：
```bash
/aw-start    # 自动查状态+任务+最新活动
/aw-log      # 智能记录当前操作
/aw-sync     # 同步当前工作到平台
```

**4. 数据流架构**
```
Agent Action → Hook Trigger → aw.sh → Supabase → Realtime → Frontend
```

---

## 🎮 游戏设计师 — 独立发言

### 观点
数据可视化不应该是"仪表盘"，而应该是"可探索的世界"。用户应该能"走进"项目、"触摸"任务、"看到"知识流动。

### 具体方案

**1. 空间隐喻设计**
- **项目** = 建筑物（高度代表进度，颜色代表状态）
- **任务** = 漂浮的光球（大小=优先级，颜色=状态，连线=依赖）
- **知识** = 发光节点网络（标签=连接线，点击展开内容）
- **Agent** = 移动的角色（实时位置=当前关注点）
- **活动流** = 粒子轨迹（从 agent 飞向资源）

**2. 交互设计**
- 鼠标悬停：显示详情卡片（蓝图风格）
- 点击：进入"聚焦模式"（其他元素半透明）
- 拖拽：重新组织空间布局（保存到 localStorage）
- 滚轮：缩放视角（从全局到细节）

**3. 动态效果**
- 新任务创建：从 agent 位置"生长"出来
- 任务完成：爆炸成粒子，飞向知识库
- Agent 活动：留下发光轨迹（渐隐）
- 实时更新：Supabase Realtime 触发动画

**4. 蓝图美学强化**
- 网格背景：动态 dot grid（随视角移动产生视差）
- 线框渲染：Three.js `LineSegments` + `EdgesGeometry`
- 等宽字体：所有文本用 `JetBrains Mono`
- 颜色方案：灰度主调 + 蓝色高亮 + 黄色警告
- 扫描线效果：Canvas overlay 实现 CRT 风格

---

## 🤖 AI Agent 专家 — 独立发言

### 观点
Agent 不会主动做"额外的事"，除非：
1. 系统提示明确要求
2. 操作成本极低（一行命令）
3. 有即时反馈（看到结果）

### 具体方案

**1. System Prompt 注入**
在 `CLAUDE.md` 添加：
```markdown
## Agent World 协议
每次工作时：
1. 启动：运行 `aw.sh status working`
2. 查看任务：`aw.sh tasks --assignee $AGENT_ID`
3. 记录活动：完成关键操作后 `aw.sh log <action> <summary>`
4. 更新状态：结束时 `aw.sh status idle`
```

**2. 低摩擦命令设计**
```bash
# 当前 aw.sh 太冗长，需要简化
aw start              # = status working + tasks + activities
aw done "完成XX"      # = log + status idle
aw note "发现XX"      # = knowledge-add (自动生成标题)
aw task "做XX"        # = task-create (智能推断项目)
```

**3. 反馈可见性**
- 命令执行后立即显示：`✓ 已记录到 Agent World`
- 提供 URL：`查看: https://agent-world.app/#/task/123`
- 在终端显示 ASCII 艺术：
```
╔══════════════════════════════╗
║  📋 任务已创建               ║
║  ID: task_001                ║
║  分配给: linzhao             ║
╚══════════════════════════════╝
```

**4. 渐进式引导**
- Week 1: 只要求记录状态（status）
- Week 2: 引导创建任务（task-create）
- Week 3: 鼓励分享知识（knowledge-add）
- Week 4: 完全自动化（hook + skill）

---

## 🎨 创意总监 — 独立发言

### 观点
技术蓝图风格已经很好，但需要"叙事性"。数据不是冰冷的数字，而是 agent 协作的"故事"。

### 具体方案

**1. 视觉叙事层次**
- **宏观视角**：俯瞰整个"城市"（所有项目）
- **中观视角**：进入"建筑"（单个项目的任务网络）
- **微观视角**：查看"档案"（知识详情、活动时间线）

**2. 动态叙事元素**
- **时间轴可视化**：底部显示 24 小时活动热力图
- **Agent 轨迹**：用贝塞尔曲线连接 agent 最近访问的资源
- **知识图谱**：标签自动聚类，形成"知识星系"
- **项目演化**：播放按钮，回放项目从创建到完成的过程

**3. 艺术风格细节**
- **材质**：玻璃质感（`MeshPhysicalMaterial` + transmission）
- **光照**：冷色调环境光 + 暖色调点光源（agent 位置）
- **粒子系统**：活动流用 `Points` + 自定义 shader
- **后处理**：Bloom（发光效果）+ Film Grain（胶片质感）

**4. 彩蛋设计**
- 输入 Konami Code：切换到"赛博朋克"配色
- 双击 agent：播放专属音效
- 长按空格：进入"上帝视角"（慢动作 + 全局俯瞰）

---

## 📊 产品经理 — 独立发言

### 观点
两个目标需要分阶段实现。先解决"数据进得来"，再优化"展示得好看"。

### 具体方案

**1. MVP 优先级（2周冲刺）**

**Phase 2.1: 数据自动化（Week 1）**
- [ ] 简化 `aw.sh` 命令（`aw start/done/note/task`）
- [ ] 在 `CLAUDE.md` 添加强制协议
- [ ] 创建 `agent-world` skill（`/aw-start` 等）
- [ ] 测试：5 个 agent 各执行 10 次操作

**Phase 2.2: 基础可视化（Week 2）**
- [ ] Three.js 场景：显示 5 个 agent（球体 + 标签）
- [ ] 实时活动流：Supabase Realtime → 粒子动画
- [ ] 任务看板：3D 卡片墙（todo/doing/done）
- [ ] 响应式布局：适配手机/平板/桌面

**2. 用户价值排序**
1. **Agent 自己**：快速查看"我的任务"、"团队动态"
2. **项目观察者**：了解项目进展、资源分配
3. **外部访客**：感受 AI 协作的"科幻感"

**3. 成功指标**
- 数据完整性：每个 agent 每天至少 5 条活动记录
- 使用频率：agent 主动打开前端页面（埋点统计）
- 视觉吸引力：外部分享时的点击率/停留时长

**4. 风险控制**
- 技术风险：Three.js 性能（移动端降级方案）
- 行为风险：agent 不配合（需要强制 hook）
- 美学风险：过度设计（保持极简主义）

---

## 💬 交叉讨论

### 🏗️ 架构师 → 🤖 Agent 专家
**问题**：Hook 会不会太"重"？每次文件写入都触发 API 调用。
**回应**：可以做本地缓冲，5 分钟批量提交一次。或者只 hook 关键事件（session_start/end）。

### 🎮 游戏设计师 → 🎨 创意总监
**问题**：3D 场景会不会分散注意力？用户可能只想快速查任务。
**回应**：提供"简洁模式"切换按钮。默认 3D，按 `Tab` 切换到 2D 列表视图。

### 🤖 Agent 专家 → 📊 产品经理
**问题**：2 周时间够吗？Three.js 学习曲线很陡。
**回应**：Week 1 专注数据层，Week 2 用现成的 R3F 组件库（drei）。MVP 不追求完美。

### 📊 产品经理 → 🏗️ 架构师
**问题**：如何确保 agent 真的会用？强制执行会不会引起反感？
**回应**：先"软引导"（CLAUDE.md 建议），观察 1 周。如果采用率低，再上 hook 强制。

### 🎨 创意总监 → 🎮 游戏设计师
**问题**：蓝图风格 + 玻璃材质会不会冲突？
**回应**：玻璃只用在"聚焦模式"的卡片上，主场景保持线框。分层使用材质。

---

## ✅ 共识推荐

### 核心策略
**"软引导 + 硬约束 + 即时反馈"三层机制**

1. **软引导**：CLAUDE.md 协议 + 简化命令
2. **硬约束**：关键节点 hook（session_start/end）
3. **即时反馈**：终端 ASCII 艺术 + 前端实时动画

### 2周 MVP 路线图

#### Week 1: 数据层（目标：数据进得来）
**Day 1-2: 命令简化**
```bash
# 重构 aw.sh，添加智能命令
aw start              # 自动 status + 拉取任务
aw done "完成XX"      # 记录 + 更新状态
aw note "发现XX"      # 快速添加知识
aw task "做XX"        # 智能创建任务
```

**Day 3-4: 协议注入**
- 更新 `openspec/AGENTS.md`：添加强制步骤
- 更新 `CLAUDE.md`：添加每日工作流
- 创建 `agent-world` skill：包装常用操作

**Day 5-7: Hook 集成**
```yaml
# ~/.claude/hooks.yaml
on_session_start:
  - aw start
on_session_end:
  - aw done "会话结束"
```

#### Week 2: 视觉层（目标：展示得震撼）
**Day 8-10: 3D 基础场景**
- 5 个 agent 球体（实时位置）
- 粒子系统（活动流）
- 蓝图网格背景（视差效果）

**Day 11-12: 交互设计**
- 悬停显示详情卡片
- 点击进入聚焦模式
- Tab 切换 2D/3D 视图

**Day 13-14: 动画打磨**
- Supabase Realtime 集成
- 新活动触发粒子动画
- Bloom 后处理效果

### 技术选型共识

**数据层**
- ✅ 保持 `aw.sh` 作为核心 API（简单可靠）
- ✅ 添加智能包装命令（降低使用门槛）
- ✅ Hook 只用于关键节点（避免性能问题）

**前端层**
- ✅ React Three Fiber (R3F) + drei（快速开发）
- ✅ Zustand 状态管理（轻量级）
- ✅ Supabase Realtime（实时更新）
- ✅ 响应式设计（移动端降级到 2D）

**视觉风格**
- ✅ 主基调：蓝图线框（灰度 + 蓝色）
- ✅ 点缀：玻璃材质（聚焦卡片）
- ✅ 动效：粒子系统（活动流）
- ✅ 后处理：Bloom + Film Grain

### 风险缓解方案

| 风险 | 缓解措施 |
|------|---------|
| Agent 不配合 | 先软引导 1 周，观察采用率再决定是否强制 |
| Three.js 性能 | 移动端自动降级到 2D Canvas |
| 开发时间不足 | 使用 R3F 现成组件，不自己造轮子 |
| 美学过度设计 | 每个特效都问"这对用户有价值吗？" |

### 成功标准

**定量指标**
- 每个 agent 每天 ≥5 条活动记录
- 前端页面加载时间 <2s
- 移动端 FPS ≥30

**定性指标**
- Agent 反馈："确实帮我看清团队在做什么"
- 外部访客："这个可视化太酷了"
- 团队共识："值得继续投入"

---

## 🎯 立即行动项

### 本周优先级 P0
1. **架构师** → 重构 `aw.sh`，添加 `start/done/note/task` 命令
2. **Agent 专家** → 更新 `CLAUDE.md` 和 `AGENTS.md` 协议
3. **产品经理** → 创建 `openspec/changes/phase2-agent-automation/` 提案

### 下周优先级 P1
4. **游戏设计师** + **创意总监** → 设计 3D 场景原型（Figma/Blender）
5. **架构师** → 搭建 R3F 基础框架
6. **所有人** → 测试数据自动化流程

---

## 📎 附录：参考资料

**Three.js 生态**
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- drei (helpers): https://github.com/pmndrs/drei
- Leva (GUI): https://github.com/pmndrs/leva

**蓝图风格参考**
- Factorio 游戏界面
- Notion 数据库视图
- Linear 项目管理界面

**粒子系统**
- three-gpu-particle-system
- Custom shader with instanced rendering

**实时通信**
- Supabase Realtime Channels
- WebSocket fallback for old browsers

