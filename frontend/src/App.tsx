import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { AgentWorld } from './scenes/AgentWorld'
import { MobileView } from './components/MobileView'
import { useStore } from './store/useStore'
import './index.css'

const TABS = [
  { id: 'world', label: 'WORLD' },
  { id: 'tasks', label: 'TASKS' },
  { id: 'projects', label: 'PROJECTS' },
] as const
type TabId = (typeof TABS)[number]['id']

const STATUS_LABEL: Record<string, string> = { working: 'WORKING', idle: 'IDLE', thinking: 'THINKING', reviewing: 'REVIEWING' }

export default function App() {
  const [tab, setTab] = useState<TabId>('world')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [isLeftOpen, setIsLeftOpen] = useState(false)
  const [isRightOpen, setIsRightOpen] = useState(false)
  const [isMobile] = useState(() => window.innerWidth < 768)
  const { agents, tasks, projects, activities, fetchAll, selectedProject, setSelectedProject } = useStore()

  useEffect(() => { fetchAll() }, [fetchAll])

  const selectedAgent = agents.find(a => a.id === selectedAgentId)
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const doingTasks = tasks.filter(t => t.status === 'doing')

  // Parse 3D scene selection: "projectId" or "projectId:category"
  const selectedProjId = selectedProject?.split(':')[0] || null
  const selectedCategory = selectedProject?.split(':')[1] || null
  const selectedProjData = projects.find(p => p.id === selectedProjId)
  const selectedCatTasks = selectedProjId
    ? tasks.filter(t => t.project_id === selectedProjId && (!selectedCategory || t.category === selectedCategory))
    : []

  // Open right panel when 3D object clicked
  useEffect(() => {
    if (selectedProject) {
      setIsRightOpen(true)
      setSelectedAgentId(null)
      if (isMobile) setIsLeftOpen(false)
    }
  }, [selectedProject, isMobile])

  return (
    <div className="layout">
      <header className="header">
        <button className="hamburger" onClick={() => setIsLeftOpen(v => !v)}>[MENU]</button>
        AGENT WORLD<span className="header-sub"> / AI COLLABORATION PLATFORM</span>
      </header>

      <aside className={`left-panel${isLeftOpen ? ' open' : ''}`}>
        <button className="panel-close" onClick={() => setIsLeftOpen(false)}>[X]</button>
        <div className="panel-section">
          <div className="panel-title">▶ AGENTS</div>
          {agents.map(a => (
            <div key={a.id} className={`reg-row${selectedAgentId === a.id ? ' selected' : ''}`}
              onClick={() => {
                const next = selectedAgentId === a.id ? null : a.id
                setSelectedAgentId(next)
                if (next) setIsRightOpen(true)
                else setIsRightOpen(false)
                setIsLeftOpen(false)
              }}>
              <span className="reg-name">{a.emoji} {a.name}</span>
              <span className={`reg-status ${a.status}`}>{STATUS_LABEL[a.status] || a.status}</span>
            </div>
          ))}
        </div>
        <div className="panel-section">
          <div className="panel-title">▶ STATISTICS</div>
          <div className="reg-row"><span className="reg-name">PROJECTS</span><span className="reg-val">{projects.length}</span></div>
          <div className="reg-row"><span className="reg-name">TASKS</span><span className="reg-val">{tasks.length}</span></div>
          <div className="reg-row"><span className="reg-name">DONE</span><span className="reg-val">{doneTasks}</span></div>
        </div>
      </aside>

      <main className="center">
        {tab === 'world' ? (
          isMobile ? (
            <MobileView projects={projects} tasks={tasks} />
          ) : (
            <Canvas camera={{ position: [0, 15, 15], fov: 50 }} style={{ background: 'transparent' }}>
              <AgentWorld />
            </Canvas>
          )
        ) : (
          <div className="placeholder">{tab.toUpperCase()} — 开发中</div>
        )}
      </main>

      <aside className={`right-panel${isRightOpen ? ' open' : ''}`}>
        <button className="panel-close" onClick={() => { setIsRightOpen(false); setSelectedAgentId(null); setSelectedProject(null); setIsLeftOpen(true) }}>[X]</button>
        {selectedAgent ? (
          <div className="panel-section">
            <div className="panel-title">▶ {selectedAgent.emoji} {selectedAgent.name}</div>
            <div className="dash-line">ROLE: {selectedAgent.role}</div>
            <div className="dash-line">STATUS: {STATUS_LABEL[selectedAgent.status] || selectedAgent.status}</div>
            <div className="panel-title" style={{marginTop:'0.5rem'}}>TASKS</div>
            {tasks.filter(t => t.assignee_id === selectedAgent.id).slice(0, 8).map(t => (
              <div key={t.id} className="dash-line">[{t.status}] {t.title}</div>
            ))}
          </div>
        ) : selectedProjData ? (
          <div className="panel-section">
            <div className="panel-title">▶ {selectedProjData.name}{selectedCategory ? ` / ${selectedCategory}` : ''}</div>
            <div className="dash-line">STATUS: {selectedProjData.status}</div>
            <div className="dash-line">TASKS: {selectedCatTasks.length}</div>
            <div className="panel-title" style={{marginTop:'0.5rem'}}>TASK LIST</div>
            {selectedCatTasks.slice(0, 12).map(t => (
              <div key={t.id} className="dash-line">[{t.status}] {t.title}</div>
            ))}
          </div>
        ) : (
          <div className="panel-section">
            <div className="panel-title">▶ ACTIVITY LOG</div>
            {activities.slice(0, 12).map(a => (
              <div key={a.id} className="dash-line">[{a.agent_id}] {a.summary}</div>
            ))}
          </div>
        )}
        {doingTasks.length > 0 && (
          <div className="panel-section">
            <div className="panel-title">▶ IN PROGRESS</div>
            {doingTasks.slice(0, 5).map(t => (
              <div key={t.id} className="dash-line">{t.assignee_id}: {t.title}</div>
            ))}
          </div>
        )}
      </aside>

      <nav className="nav">
        {TABS.map(t => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </nav>
    </div>
  )
}
