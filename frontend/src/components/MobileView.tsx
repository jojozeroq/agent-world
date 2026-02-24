import type { Project, Task } from '../types'
import { useStore } from '../store/useStore'

interface MobileViewProps {
  projects: Project[]
  tasks: Task[]
}

export function MobileView({ projects, tasks }: MobileViewProps) {
  const { setSelectedProject } = useStore()

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: '1rem' }}>
      <svg viewBox="0 0 300 400" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', display: 'block' }}>
        {projects.map((p, i) => {
          const x = 150 + (i % 2 === 0 ? -60 : 60)
          const y = 50 + Math.floor(i / 2) * 80
          const taskCount = tasks.filter(t => t.project_id === p.id).length
          return (
            <g key={p.id} onClick={() => setSelectedProject(p.id)} style={{ cursor: 'pointer' }}>
              <polygon
                points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15"
                transform={`translate(${x},${y})`}
                fill={p.color}
                fillOpacity={0.15}
                stroke="#333"
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
    </div>
  )
}
