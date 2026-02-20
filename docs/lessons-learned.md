# Agent World 项目经验沉淀

> 陆舟 | 2026-02-20

## 一、设计方向的教训

### 不要假设，要看参考图
- 第一轮设计完全理解错了参考项目的风格（以为是"深色科技感"，实际是"浅色工程蓝图"）
- **教训**：拿到参考图后，先让人/AI 做详细的设计元素拆解，再动手
- Jolin 提供的详细分析比我们自己的分析准确得多

### 双模式是个坑
- 最初做了"色彩模式+简笔画模式"切换，结果变成了"黑夜+白天"，与设计意图不符
- **教训**：先做好一种模式，确认方向对了再考虑多模式

## 二、技术经验

### TypeScript 类型问题
- R3F 中 `<line>` 会被 React 当作 SVG 元素，导致 ref 类型冲突 → 用 `<primitive>` 替代
- `Sprite` 不是 `@react-three/drei` 的导出 → 用小写 `<sprite>`（R3F 原生元素）
- drei 的 `Text` 组件引用外部字体 URL 时，字体删除后会导致 React error #185

### 响应式布局
- `100vh` 在移动浏览器不包含地址栏/底栏 → 用 `100dvh`
- Grid 布局在小屏隐藏面板时仍会分配列空间 → 小屏用 fixed 定位脱离文档流
- `transform: translateX(-100%)` 比 `display:none` 更适合做弹出动效

### 3D Canvas 与 UI 层交互
- OrbitControls 会拦截 pointer 事件，导致 UI 按钮需要双击
- 解决：UI 层设 `z-index: 10`，canvas 设 `z-index: 1`
- 顶栏/底栏用 `pointer-events: none`，子元素恢复 `pointer-events: auto`

### CI/CD
- GitHub Actions 默认每次 push 都触发 → 用 `paths: ['frontend/**']` 过滤
- 加 `workflow_dispatch` 支持手动触发

## 三、协作经验

### 子任务派发
- 给何筑的 task 描述越具体越好：写清文件路径、CSS 值、验收标准
- 小改动（1-2个文件）直接自己改比派子任务更快
- 连续执行模式（完成一个立刻派下一个）比定时任务效率高

### 定时任务
- `isolated` + `agentTurn` + `delivery: "announce"` 是正确模式
- 任务完成后记得关闭定时任务
- 定时任务适合长周期自动推进，短期冲刺用连续执行更好
