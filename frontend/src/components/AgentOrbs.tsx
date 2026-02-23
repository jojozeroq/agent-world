import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Agent, Activity, Task } from '../types'

interface AgentOrbsProps {
  agents: Agent[]
  activities: Activity[]
  tasks: Task[]
}

const AGENT_COLORS: Record<string, string> = {
  linzhao: '#ff6b6b',
  moyuan: '#4ecdc4',
  hezhu: '#ffe66d',
  luzhou: '#a8e6cf',
  sutang: '#ff8b94'
}

export function AgentOrbs({ agents, activities, tasks }: AgentOrbsProps) {
  const agentPositions = useMemo(() => {
    const positions = new Map<string, [number, number, number]>()
    agents.forEach(agent => {
      const lastActivity = activities.find(a => a.agent_id === agent.id)
      if (!lastActivity) {
        positions.set(agent.id, [0, 2, 0])
        return
      }
      const taskMatch = lastActivity.summary.match(/task[_\s]?id[:\s]+([a-f0-9-]+)/i)
      if (taskMatch) {
        const task = tasks.find(t => t.id === taskMatch[1])
        if (task) {
          const catIndex = tasks.filter(t => t.category === task.category).indexOf(task)
          positions.set(agent.id, [catIndex * 0.5, 1.5, 0])
          return
        }
      }
      positions.set(agent.id, [0, 2, 0])
    })
    return positions
  }, [agents, activities, tasks])

  return (
    <group>
      {agents.map(agent => (
        <AgentOrb
          key={agent.id}
          agent={agent}
          position={agentPositions.get(agent.id) || [0, 2, 0]}
          color={AGENT_COLORS[agent.id] || '#ffffff'}
        />
      ))}
    </group>
  )
}

function AgentOrb({ agent, position, color }: { agent: Agent; position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.1
  })

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <Text position={[0, 0.3, 0]} fontSize={0.2} anchorX="center" anchorY="middle">
        {agent.emoji}
      </Text>
    </group>
  )
}
