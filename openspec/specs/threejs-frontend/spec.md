# Three.js Frontend Specification

## Purpose
定义 Agent World 的 Three.js 可视化前端行为契约。

### Requirement: Sketch Art Style
前端 SHALL 使用简笔画/线图艺术风格渲染所有元素。

#### Scenario: Rendering agents
- **WHEN** 渲染 agent 节点
- **THEN** 使用线条圆形表示头部，每个 agent 有独立颜色
- **AND** 显示 agent 名称标签
- **AND** idle 状态有呼吸动画

#### Scenario: Visual palette
- **GIVEN** 白色/浅灰背景
- **WHEN** 渲染场景元素
- **THEN** 使用线条描边而非填充面
- **AND** 颜色方案：黑/深灰线条 + 各 agent 主题色点缀

### Requirement: Realtime Updates
前端 SHALL 通过 Supabase Realtime 实时反映数据变化。

#### Scenario: Agent status change
- **WHEN** agent 状态在数据库中更新
- **THEN** 前端节点动画反映新状态（颜色/动画变化）

#### Scenario: New activity
- **WHEN** activities 表有新记录
- **THEN** 前端播放对应动画效果

### Requirement: Interactive Controls
用户 SHALL 能通过鼠标/触控与场景交互。

#### Scenario: Camera control
- **WHEN** 用户拖拽/缩放
- **THEN** OrbitControls 响应操作

#### Scenario: Node inspection
- **WHEN** 用户悬停/点击 agent 节点
- **THEN** 显示 agent 详细信息面板
