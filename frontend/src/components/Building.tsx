import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Task } from '../types'

interface BuildingProps {
  tasks: Task[]
  color: string
  position: [number, number, number]
  onHover?: (hovered: boolean) => void
  onClick?: () => void
}

const FLOOR_HEIGHT = 0.3
const HEX_RADIUS = 0.8

function createFlatTopHexShape(radius: number) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return shape
}

const sharedShape = createFlatTopHexShape(HEX_RADIUS)

function Floor({ task, y, color }: { task: Task; y: number; color: string }) {
  const lineRef = useRef<THREE.LineSegments>(null)
  const [edges, geo] = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(sharedShape, { depth: FLOOR_HEIGHT, bevelEnabled: false })
    return [new THREE.EdgesGeometry(g), g]
  }, [])

  useFrame(({ clock }) => {
    if (!lineRef.current) return
    const mat = lineRef.current.material as THREE.LineBasicMaterial
    if (task.status === 'doing') {
      mat.opacity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3
    }
  })

  const lineOpacity = task.status === 'todo' ? 0.3 : task.status === 'done' ? 1 : 0.7

  return (
    <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geo as any}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <lineSegments ref={lineRef} geometry={edges as any}>
        <lineBasicMaterial color="#333333" transparent opacity={lineOpacity} />
      </lineSegments>
    </group>
  )
}

export function Building({ tasks, color, position, onHover, onClick }: BuildingProps) {
  const sorted = [...tasks].sort((a, b) => b.priority - a.priority)
  return (
    <group position={position}
      onPointerOver={(e) => { e.stopPropagation(); onHover?.(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { onHover?.(false); document.body.style.cursor = 'default' }}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
    >
      {sorted.map((task, i) => (
        <Floor key={task.id} task={task} y={i * FLOOR_HEIGHT} color={color} />
      ))}
    </group>
  )
}
