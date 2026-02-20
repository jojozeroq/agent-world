import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AgentNode } from '../components/AgentNode'
import * as THREE from 'three'

const AGENTS = [
  { id: 'linzhao', name: '林昭', emoji: '🌟', color: '#00f0ff', position: [0, 0, 0] as [number, number, number], phase: 0 },
  { id: 'moyuan', name: '墨渊', emoji: '🔬', color: '#7b2ff7', position: [-3, 1.5, -1] as [number, number, number], phase: 1.2 },
  { id: 'hezhu', name: '何筑', emoji: '💻', color: '#2ECC71', position: [3, 1, -0.5] as [number, number, number], phase: 2.4 },
  { id: 'luzhou', name: '陆舟', emoji: '📋', color: '#E67E22', position: [-2, -2, 0.5] as [number, number, number], phase: 3.6 },
  { id: 'sutang', name: '苏棠', emoji: '🌸', color: '#ff2d78', position: [2, -2, -0.5] as [number, number, number], phase: 4.8 },
]

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [3, 4],
]

function ConnectionLine({ start, end }: { start: [number,number,number]; end: [number,number,number] }) {
  const lineObj = useMemo(() => {
    const mid: [number,number,number] = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 0.8,
      (start[2] + end[2]) / 2 - 0.5,
    ]
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...end),
    ])
    const points = curve.getPoints(50)
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    const mat = new THREE.LineBasicMaterial({ color: '#cccccc' })
    return new THREE.Line(geo, mat)
  }, [start, end])

  return <primitive object={lineObj} />
}

export function AgentWorld() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.8} />

        {CONNECTIONS.map(([i, j], idx) => (
          <ConnectionLine key={idx} start={AGENTS[i].position} end={AGENTS[j].position} />
        ))}

        {AGENTS.map((agent) => (
          <AgentNode key={agent.id} {...agent} />
        ))}

        <OrbitControls enablePan enableZoom enableRotate dampingFactor={0.08} enableDamping />
      </Canvas>
    </div>
  )
}
