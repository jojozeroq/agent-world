import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
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

function ConnectionLine({ start, end, color = '#00f0ff' }: { start: [number,number,number]; end: [number,number,number]; color?: string }) {
  const ref = useRef<THREE.Line>(null)

  const curve = useMemo(() => {
    const mid: [number,number,number] = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 0.8,
      (start[2] + end[2]) / 2 - 0.5,
    ]
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...end),
    ])
  }, [start, end])

  const geometry = useMemo(() => {
    const points = curve.getPoints(50)
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    geo.computeBoundingSphere()
    // Required for LineDashedMaterial to work
    const line = new THREE.Line(geo)
    line.computeLineDistances()
    return line.geometry
  }, [curve])

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.LineDashedMaterial
      mat.dashOffset = -clock.elapsedTime * 0.5
    }
  })

  return (
    <line ref={ref} geometry={geometry}>
      <lineDashedMaterial color={color} transparent opacity={0.3} dashSize={0.3} gapSize={0.2} linewidth={1} />
    </line>
  )
}

export function AgentWorld() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#00f0ff" />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#7b2ff7" />

        {CONNECTIONS.map(([i, j], idx) => (
          <ConnectionLine key={idx} start={AGENTS[i].position} end={AGENTS[j].position} color={AGENTS[i].color} />
        ))}

        {AGENTS.map((agent) => (
          <AgentNode key={agent.id} {...agent} />
        ))}

        <OrbitControls enablePan enableZoom enableRotate dampingFactor={0.08} enableDamping />
      </Canvas>
    </div>
  )
}
