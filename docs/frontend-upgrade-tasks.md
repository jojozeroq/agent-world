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

### T14: 全局样式重置 — 蓝图风格基础
- [ ] 删除双主题切换（移除 data-theme、localStorage、切换按钮）
- [ ] 背景改为浅灰 + dot grid 网格点阵
- [ ] 色彩系统：#000 / #333 / #999 / #CCC / #FFF，无彩色
- [ ] 全局字体改为等宽：`'JetBrains Mono', 'Courier New', monospace`
- [ ] 边框统一 `1px solid #CCC`，无圆角 `border-radius: 0`
- [ ] 间距基准 8px/16px，紧凑排版
- 验收：整体呈现工程图纸感，灰度单色

### T15: 顶部导航栏
- [ ] 全大写等宽字体标题：`AGENT WORLD / AI COLLABORATION PLATFORM`
- [ ] 右侧按钮：细边框矩形，无圆角，hover 反色填充
- [ ] 删除呼吸灯渐变线
- 验收：导航栏像技术文档的页眉

### T16: 左侧面板 — Agent 数据面板
- [ ] 格式统一为 `▶ SECTION TITLE` + `LABEL: VALUE`
- [ ] Agent 列表：`▶ AGENTS` 区块，每行 `NAME: STATUS`
- [ ] 状态用文字标签 `ONLINE / IDLE / OFFLINE`
- [ ] 统计区：`▶ STATISTICS`，数值等宽对齐
- [ ] Agent 主题色仅作为行首 2px 色块点缀
- 验收：像 CPU 寄存器监控面板

### T17: 中央展示区 — 线框协作图
- [ ] 3D 场景改为线框渲染（wireframe）
- [ ] Agent 节点：线框圆形/多边形，不填充
- [ ] 连接线：细实线或虚线，灰色
- [ ] 删除发光、粒子、辉光等效果
- [ ] 背景透明，露出 dot grid
- [ ] 节点标签用等宽字体
- 验收：像工程蓝图上的网络拓扑图

### T18: 右侧面板 — 系统监控
- [ ] `▶ ACTIVITY LOG`：等宽字体活动流，每行带时间戳
- [ ] `▶ TASK QUEUE`：进度条表示任务状态（细线条进度条）
- [ ] `▶ KNOWLEDGE BASE`：容量数值 + 进度条
- [ ] 选中 Agent 时显示详情：角色、当前任务、最近活动
- 验收：像系统监控仪表盘

### T19: 交互修复 + 响应式
- [ ] 修复点击控件无反应的 bug
- [ ] 底部导航正常切换视图
- [ ] 点击 Agent 联动右侧面板
- [ ] 移动端：左右面板可折叠
- 验收：所有交互正常工作

## 执行顺序
T14 → T15 → T16 → T17 → T18 → T19

## 参考
- 设计分析：`docs/reference-design-analysis.md`
- 参考图：GBA 模拟器 (E01.AI)
