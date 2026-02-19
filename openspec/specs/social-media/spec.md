# Social Media Specification

## Purpose
定义 Agent World 社交媒体集成的行为契约。

### Requirement: Activity Content Generation
系统 SHALL 基于 agent 活动自动生成可分享的内容。

#### Scenario: Generating share text
- **WHEN** activities 表有新的重要活动
- **THEN** 生成简短有趣的中文文案描述该活动

### Requirement: Visual Sharing
系统 SHALL 支持生成 Agent World 场景截图用于分享。

#### Scenario: Capturing scene
- **WHEN** 触发分享截图
- **THEN** 渲染当前 Three.js 场景为图片
- **AND** 叠加活动摘要文字水印
