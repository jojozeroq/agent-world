# 前端重设计任务拆解 v4

> 来源：Jolin 反馈 + 参考项目详细分析（2026-02-20）
> 风格：技术蓝图 / 工程图纸美学
> 设计参考：`docs/reference-design-analysis.md`
> 负责人：何筑 (coder) | PM：陆舟

## 设计方向
- 只保留一种模式：蓝图/工程图纸风格
- 删除色彩模式/简笔画模式切换
- 灰度为主，等宽字体，网格点阵背景，无圆角，线框渲染

## 任务清单

### T14: 全局样式重置 — 蓝图风格基础 ✅
- [x] 删除双主题切换（移除 data-theme、localStorage、切换按钮）
- [x] 背景改为浅灰 + dot grid 网格点阵
- [x] 色彩系统：#000 / #333 / #999 / #CCC / #FFF，无彩色
- [x] 全局字体改为等宽：`'JetBrains Mono', 'Courier New', monospace`
- [x] 边框统一 `1px solid #CCC`，无圆角 `border-radius: 0`
- [x] 间距基准 8px/16px，紧凑排版

### T15: 顶部导航栏 ✅
- [x] 全大写等宽字体标题：`AGENT WORLD / AI COLLABORATION PLATFORM`
- [x] 右侧按钮：细边框矩形，无圆角，hover 反色填充
- [x] 删除呼吸灯渐变线

### T16: 左侧面板 — Agent 数据面板 ✅
- [x] 格式统一为 `▶ SECTION TITLE` + `LABEL: VALUE`
- [x] Agent 列表：`▶ AGENTS` 区块，每行 `NAME: STATUS`
- [x] 状态用文字标签 `ONLINE / IDLE / OFFLINE`
- [x] 统计区：`▶ STATISTICS`，数值等宽对齐
- [x] Agent 主题色仅作为行首 2px 色块点缀

### T17: 中央展示区 — 线框协作图 ✅
- [x] 3D 场景改为线框渲染（wireframe）
- [x] Agent 节点：线框多面体，不填充
- [x] 连接线：灰色实线
- [x] 删除发光、粒子、辉光等效果
- [x] 背景透明，露出 dot grid
- [x] 节点标签用等宽字体

### T18: 右侧面板 — 系统监控 ✅
- [x] `▶ ACTIVITY LOG`：等宽字体活动流，每行带时间戳
- [x] `▶ TASK QUEUE`：进度条表示任务状态（细线条进度条）
- [x] 选中 Agent 时显示详情：角色、当前任务、最近活动

### T19: 交互修复 + 响应式 ✅
- [x] 底部导航正常切换视图
- [x] 点击 Agent 联动右侧面板
- [x] 导航按钮蓝图风格，active 反色
- [x] 移动端：左右面板可折叠

## 执行顺序
T14 → T15 → T16 → T17 → T18 → T19

## 参考
- 设计分析：`docs/reference-design-analysis.md`
- 参考图：GBA 模拟器 (E01.AI)
