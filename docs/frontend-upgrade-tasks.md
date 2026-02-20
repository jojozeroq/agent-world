# 前端视觉升级任务拆解 v3

> 来源：苏棠 UI Review + Jolin 反馈（2026-02-20）
> 设计方案：`docs/agent-world-ui-review.md`（苏棠完整方案）
> 负责人：何筑 (coder) | 设计顾问：苏棠 | PM：陆舟

## P0 — 立刻做（视觉基础）

### T7: 深色主题 + 毛玻璃 ✅
- [x] 主背景改为深空渐变 `radial-gradient(ellipse at 20% 50%, #0d1b2a, #0a0e1a)`
- [x] 左右面板改为毛玻璃 `backdrop-filter: blur(20px)` + 半透明背景
- [x] 面板不贴边，留 16px 间距，圆角 16px
- [x] 文字色改为幽灵白 `rgba(255,255,255,0.87)` / 薄雾灰 `rgba(255,255,255,0.45)`
- [x] 顶部加 1px 呼吸灯渐变线（青→紫循环 4s）
- 验收：整体深色科技感，面板悬浮毛玻璃效果

### T8: 字体 + 排版规范 ✅
- [x] 引入 Space Grotesk（标题）+ Inter（正文）+ JetBrains Mono（数据）
- [x] 用 Google Fonts CDN，index.html 里 preconnect + link
- [x] 字号体系：H1=24px/600, H2=16px/600, Body=13px/400, Caption=11px/400, Data=28px/700
- [x] 区块标题大写 + letter-spacing: 0.08em
- [x] 数字用等宽字体
- 验收：字体加载正常，排版层次清晰

## P1 — 面板改造

### T9: 左面板「Agent 档案馆」✅
- [x] Agent 列表改为卡片样式，背景 `rgba(0,240,255,0.03)` hover 升至 0.08
- [x] 每张卡片左边缘 3px 状态色竖线（活跃=青/空闲=灰/离线=暗）
- [x] 头像圆形带光晕 `box-shadow: 0 0 12px rgba(0,240,255,0.3)`
- [x] 统计卡片加渐变边框 hover 效果
- 验收：左面板有视觉层次，卡片有交互反馈

### T10: 右面板「数据仪表盘」✅
- [x] 活动流改为终端风格：等宽字体 + 彩色圆点标识类型
- [x] 新消息滑入动画
- [x] Agent 详情加能力标签药丸样式
- [x] 面板内区块用微妙分隔，背景层次区分
- 验收：右面板信息层次清晰，有科技感

## P2 — 3D 场景升级

### T11: 3D 节点 + 连接线 ✅
- [x] AgentNode 从 circleGeometry 升级为 SphereGeometry + MeshPhysicalMaterial + emissive
- [x] 每个节点外围 Sprite 辉光（径向渐变纹理）
- [x] 连接线从直线改为 CatmullRomCurve3 曲线
- [x] 连接线上光点流动动画（自定义 shader 或 dash offset）
- 验收：3D 场景有深度感，节点发光，连接线有能量流动

### T12: 粒子背景 + 交互增强 ✅
- [x] 2000 个星尘粒子，缓慢旋转 + 微弱闪烁
- [x] 节点 hover 放大 1.2x + 辉光增强 + 信息浮窗
- [x] 点击节点镜头平滑推进
- [x] 背景粒子颜色：白色为主，偶尔青色紫色
- 验收：场景有深空氛围，交互流畅

## P3 — 动画 + 打磨

### T13: 微交互动画
- [ ] 卡片 hover 上浮 2px + 阴影加深
- [ ] 面板展开/折叠 300ms ease-out
- [ ] 卡片交错入场 stagger 50ms
- [ ] 数字变化 countUp 动画
- [ ] 深色 shimmer 骨架屏
- 验收：界面有生命力，交互有反馈

## 技术注意事项
- 字体用 Google Fonts CDN（fonts.googleapis.com），index.html 里加 preconnect
- 3D shader 效果注意移动端性能，粒子数量可根据设备降级
- CSS 变量驱动主题，保留 sketch/color 双模式切换能力
- 构建时 GitHub Actions 环境内存充足，不会 OOM

## 执行顺序
T7 → T8 → T9 → T10 → T11 → T12 → T13

## 参考
- 苏棠设计方案：`docs/agent-world-ui-review.md`
- 参考项目截图：GBA 模拟器界面
- 现有前端代码：`frontend/src/App.tsx` + `frontend/src/index.css`
