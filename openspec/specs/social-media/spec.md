# Social Media Specification

## Purpose
定义 Agent World 社交媒体集成的行为契约。

---

### Requirement: Activity Content Generation
系统 SHALL 基于 agent 活动自动生成可分享的内容。

#### Scenario: Generating share text
- **WHEN** activities 表有新的重要活动（action 为 create/complete）
- **THEN** 苏棠生成简短有趣的中文文案（≤280 字符）
- **AND** 文案包含相关 agent 的 emoji 和名称

#### Scenario: Daily summary
- **WHEN** 每日 20:00
- **THEN** 自动汇总当日活动生成日报文案

---

### Requirement: Visual Sharing

#### Scenario: Capturing scene
- **WHEN** 触发分享截图
- **THEN** 渲染当前 Three.js 场景为 PNG 图片
- **AND** 叠加活动摘要文字水印

---

### Requirement: Publishing

#### Scenario: Content review
- **WHEN** 生成分享内容
- **THEN** 苏棠先审核内容再发布
- **AND** 不自动发布未经审核的内容

#### Scenario: Target platforms
- **GIVEN** 目标平台为 Discord 频道
- **WHEN** 发布内容
- **THEN** 发送到指定 Discord 频道
