# Agent World Learnings

记录从工作中学到的经验教训。

## 格式
```
### [YYYY-MM-DD] 标题
**Context:** 背景
**Learning:** 学到什么
**Action:** 如何应用
```

### [2026-03-05] RLS 策略必须允许写入
**Context:** 实施认证系统时
**Learning:** 创建表后 RLS 默认拒绝写入
**Action:** 添加 allow all 策略
