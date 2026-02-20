import { useState, useEffect } from 'react'
import { AgentWorld } from './scenes/AgentWorld'
import './index.css'

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

function AnimatedStat({ value }: { value: number | string }) {
  const num = useCountUp(typeof value === 'number' ? value : 0)
  if (typeof value === 'string') return <>{value}</>
  return <>{num}</>
}

const TABS = [
  { id: 'world', label: '🌐 世界' },
  { id: 'tasks', label: '📋 任务' },
  { id: 'knowledge', label: '📚 知识' },
  { id: 'projects', label: '📊 项目' },
  { id: 'settings', label: '⚙️ 设置' },
] as const

type TabId = (typeof TABS)[number]['id']

const AGENTS = [
  { id: 'linzhao', name: '林昭', emoji: '🌟', status: 'online' as const, color: '#e74c3c' },
  { id: 'moyuan', name: '墨渊', emoji: '🔬', status: 'online' as const, color: '#3498db' },
  { id: 'hezhu', name: '何筑', emoji: '💻', status: 'idle' as const, color: '#2ecc71' },
  { id: 'luzhou', name: '陆舟', emoji: '📋', status: 'online' as const, color: '#f39c12' },
  { id: 'sutang', name: '苏棠', emoji: '🌸', status: 'offline' as const, color: '#9b59b6' },
]

const AGENT_ROLES: Record<string, string> = {
  linzhao: '团队灵魂，负责协调和创意',
  moyuan: '技术调研专家，负责方案评估',
  hezhu: '核心开发者，负责编码实现',
  luzhou: '项目经理，负责进度管理',
  sutang: '用户体验设计师，负责交互设计',
}

const AGENT_TAGS: Record<string, string[]> = {
  linzhao: ['协调', '创意', '决策'],
  moyuan: ['调研', '分析', '评估'],
  hezhu: ['编码', 'React', 'Three.js'],
  luzhou: ['管理', '进度', '文档'],
  sutang: ['设计', 'UX', '交互'],
}

const AGENT_TASKS: Record<string, string> = {
  linzhao: '正在协调 v2 前端开发任务分配',
  moyuan: '正在调研 WebSocket 实时通信方案',
  hezhu: '正在实现右侧面板详情组件',
  luzhou: '正在更新项目甘特图和里程碑',
  sutang: '正在设计移动端适配方案',
}

const AGENT_ACTIVITIES: Record<string, { time: string; action: string }[]> = {
  linzhao: [
    { time: '12:30', action: '发起了 v2 前端设计评审' },
    { time: '11:15', action: '更新了团队周报' },
    { time: '09:00', action: '分配了 T3 右侧面板任务' },
  ],
  moyuan: [
    { time: '12:20', action: '提交了 WebSocket 方案对比文档' },
    { time: '10:45', action: '完成了 Three.js 性能测试' },
    { time: '09:30', action: 'review 了何筑的 PR' },
  ],
  hezhu: [
    { time: '12:45', action: '提交了布局组件代码' },
    { time: '11:00', action: '修复了 CSS Grid 兼容问题' },
    { time: '10:00', action: '开始实现右侧面板' },
  ],
  luzhou: [
    { time: '12:10', action: '更新了 T2 任务状态为已完成' },
    { time: '11:30', action: '创建了 T4 任务卡片' },
    { time: '09:15', action: '同步了项目进度到文档' },
  ],
  sutang: [
    { time: '11:50', action: '上传了移动端交互原型' },
    { time: '10:20', action: '完成了配色方案调整' },
    { time: '09:00', action: '提交了 Agent 头像设计稿' },
  ],
}

const GLOBAL_FEED = [
  { time: '12:45', agent: '何筑💻', action: '提交了布局组件代码' },
  { time: '12:30', agent: '林昭🌟', action: '发起了 v2 前端设计评审' },
  { time: '12:20', agent: '墨渊🔬', action: '提交了 WebSocket 方案对比文档' },
  { time: '12:10', agent: '陆舟📋', action: '更新了 T2 任务状态为已完成' },
  { time: '11:50', agent: '苏棠🌸', action: '上传了移动端交互原型' },
  { time: '11:30', agent: '陆舟📋', action: '创建了 T4 任务卡片' },
  { time: '11:15', agent: '林昭🌟', action: '更新了团队周报' },
  { time: '11:00', agent: '何筑💻', action: '修复了 CSS Grid 兼容问题' },
]

const STATUS_LABEL: Record<string, string> = { online: 'ONLINE', idle: 'IDLE', offline: 'OFFLINE' }

const STATS = [
  { label: 'TASKS DONE', value: 12 },
  { label: 'PROJECTS', value: 3 },
  { label: 'KNOWLEDGE', value: 847 },
  { label: 'LAST ACTIVE', value: '2M AGO' },
]

function CenterView({ tab }: { tab: TabId }) {
  if (tab === 'world') return <AgentWorld />
  return <div className="placeholder">{TABS.find(t => t.id === tab)?.label} - 开发中</div>
}

export default function App() {
  const [tab, setTab] = useState<TabId>('world')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [isLeftOpen, setIsLeftOpen] = useState(false)
  const [isRightOpen, setIsRightOpen] = useState(false)

  const selectedAgent = AGENTS.find(a => a.id === selectedAgentId)
  return (
    <div className="layout">
      <header className="header">
        <button className="hamburger" onClick={() => setIsLeftOpen(v => !v)}>[MENU]</button>
        AGENT WORLD / AI COLLABORATION PLATFORM
      </header>
      {(isLeftOpen || isRightOpen) && <div className="overlay-backdrop" onClick={() => { setIsLeftOpen(false); setIsRightOpen(false) }} />}
      <aside className={`left-panel${isLeftOpen ? ' open' : ''}`}>
        <div className="panel-section">
          <div className="panel-title">▶ AGENTS</div>
          {AGENTS.map(a => (
            <div
              key={a.id}
              className={`reg-row${selectedAgentId === a.id ? ' selected' : ''}`}
              onClick={() => {
                const next = selectedAgentId === a.id ? null : a.id
                setSelectedAgentId(next)
                if (next) setIsRightOpen(true)
                else setIsRightOpen(false)
                setIsLeftOpen(false)
              }}
            >
              <span className="reg-color" style={{ background: a.color }} />
              <span className="reg-name">{a.name}</span>
              <span className={`reg-status ${a.status}`}>{STATUS_LABEL[a.status]}</span>
            </div>
          ))}
        </div>
        <div className="panel-section">
          <div className="panel-title">▶ STATISTICS</div>
          {STATS.map(s => (
            <div key={s.label} className="reg-row">
              <span className="reg-name">{s.label}</span>
              <span className="reg-val">{typeof s.value === 'number' ? <AnimatedStat value={s.value} /> : s.value}</span>
            </div>
          ))}
        </div>
      </aside>
      <main className="center">
        <CenterView tab={tab} />
      </main>
      <aside className={`right-panel${isRightOpen ? ' open' : ''}`}>
        {selectedAgent ? (
          <>
            <div className="panel-section">
              <div className="panel-title">{selectedAgent.emoji} {selectedAgent.name}</div>
              <div className="agent-role">{AGENT_ROLES[selectedAgent.id]}</div>
              <div className="agent-task">📌 {AGENT_TASKS[selectedAgent.id]}</div>
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap' }}>
                {AGENT_TAGS[selectedAgent.id]?.map(tag => (
                  <span key={tag} className="agent-tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="panel-section">
              <div className="panel-title">最近活动</div>
              <div className="panel-block">
              {AGENT_ACTIVITIES[selectedAgent.id].map((a, i) => (
                <div key={i} className="feed-item">
                  <span className="feed-dot info" />
                  <span className="feed-time">{a.time}</span>
                  <span className="feed-text">{a.action}</span>
                </div>
              ))}
              </div>
            </div>
          </>
        ) : (
          <div className="panel-section">
            <div className="panel-title">全局动态</div>
            <div className="panel-block">
            {GLOBAL_FEED.map((f, i) => (
              <div key={i} className="feed-item">
                <span className="feed-dot info" />
                <span className="feed-time">{f.time}</span>
                <span className="feed-text">{f.agent} {f.action}</span>
              </div>
            ))}
            </div>
          </div>
        )}
      </aside>
      <nav className="nav">
        {TABS.map(t => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
