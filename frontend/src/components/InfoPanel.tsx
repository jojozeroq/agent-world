import { Html } from '@react-three/drei'
import type { Task } from '../types'

interface InfoPanelProps {
  position: [number, number, number]
  category?: string
  taskCount?: number
  task?: Task
}

export function InfoPanel({ position, category, taskCount, task }: InfoPanelProps) {
  return (
    <Html position={position} center>
      <div style={{
        background: 'rgba(0, 20, 40, 0.9)',
        border: '1px solid #00d4ff',
        padding: '8px 12px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00d4ff',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        {category && <div>{category} ({taskCount})</div>}
        {task && (
          <>
            <div>{task.title}</div>
            <div style={{ opacity: 0.7 }}>{task.status} • {task.assignee_id}</div>
          </>
        )}
      </div>
    </Html>
  )
}
