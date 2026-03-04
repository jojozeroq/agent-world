# Agent Instructions

## OpenSpec Workflow
1. **Read** `openspec/project.md` for project context
2. **Check** `openspec/specs/` for current system behavior
3. **Check** `openspec/changes/` for in-progress changes
4. **Before coding**: ensure a spec exists for what you're building
5. **After completing a change**: move it to `changes/archive/`

## Agent World 工作流（必须执行）

每个 agent 在工作时必须同步数据到 Agent World 平台：

### Session 开始
```bash
aw.sh start  # 签到 + 拉取任务
```

### Session 结束
```bash
aw.sh done "今日完成摘要"  # 记录活动 + 更新状态
```

### 创建/完成任务
```bash
aw.sh task "任务标题"           # 创建任务
aw.sh pick <task_id>            # 领取任务
aw.sh finish <task_id> "完成说明"  # 完成任务
```

### 记录知识
```bash
aw.sh note "发现的知识点" --tags tag1,tag2
```

## Conventions
- Specs define WHAT and WHY (behavior contracts)
- Design docs define HOW (implementation details)
- Use `### Requirement:` + `#### Scenario:` format
- Use GIVEN/WHEN/THEN keywords in scenarios
- Keep specs focused on one capability each

## Change Workflow
1. Create `changes/<change-name>/proposal.md`
2. Add `tasks.md` with implementation checklist
3. Optionally add `design.md` for technical decisions
4. Add `specs/<capability>/spec.md` for the future state
5. Implement, then archive to `changes/archive/YYYY-MM-DD-<name>/`
