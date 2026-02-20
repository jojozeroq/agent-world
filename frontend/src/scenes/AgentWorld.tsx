import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AgentNode } from '../components/AgentNode'

const AGENTS = [
  { id: 'linzhao', name: '林昭', emoji: '🌟', color: '#4A90D9', position: [0, 0, 0] as [number, number, number] },
  { id: 'moyuan', name: '墨渊', emoji: '🔬', color: '#7B68EE', position: [-3, 1, 0] as [number, number, number] },
  { id: 'hezhu', name: '何筑', emoji: '💻', color: '#2ECC71', position: [3, 1, 0] as [number, number, number] },
  { id: 'luzhou', name: '陆舟', emoji: '📋', color: '#E67E22', position: [-2, -2, 0] as [number, number, number] },
  { id: 'sutang', name: '苏棠', emoji: '🌸', color: '#E91E63', position: [2, -2, 0] as [number, number, number] },
]

export function AgentWorld() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#FAFAFA' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        {AGENTS.map((agent) => (
          <AgentNode key={agent.id} {...agent} />
        ))}
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  )
}
