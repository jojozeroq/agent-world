import { useState } from 'react'
import type { Project, Task } from '../types'

interface MobileViewProps {
  projects: Project[]
  tasks: Task[]
}

export function MobileView({ projects, tasks }: MobileViewProps) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', background: '#0A1628', padding: '1rem' }}>
      <svg viewBox="0 0 300 400" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', display: 'block' }}>
        {projects.map((p, i) => {
          const x = 150 + (i % 2 === 0 ? -60 : 60)
          const y = 50 + Math.floor(i / 2) * 80
          const taskCount = tasks.filter(t => t.project_id === p.id).length
          return (
            <g key={p.id} onClick={() => setSelected(selected === p.id ? null : p.id)} style={{ cursor: 'pointer' }}>
              <polygon
                points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15"
                transform={`translate(${x},${y})`}
                fill="none"
                stroke={p.color}
                strokeWidth="2"
              />
              <text x={x} y={y} textAnchor="middle" fill={p.color} fontSize="10" fontFamily="monospace">
                {p.name}
              </text>
              <text x={x} y={y + 12} textAnchor="middle" fill="#888" fontSize="8" fontFamily="monospace">
                {taskCount} tasks
              </text>
            </g>
          )
        })}
      </svg>
      {selected && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a2332', borderRadius: '4px' }}>
          <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: '14px', marginBottom: '0.5rem' }}>
            {projects.find(p => p.id === selected)?.name}
          </div>
          {tasks.filter(t => t.project_id === selected).map(t => (
            <div key={t.id} style={{ color: '#aaa', fontFamily: 'monospace', fontSize: '12px', padding: '0.25rem 0' }}>
              [{t.status}] {t.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
