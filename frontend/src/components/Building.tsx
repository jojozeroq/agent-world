import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Task } from '../types'

interface BuildingProps {
  tasks: Task[]
  color: string
  position: [number, number, number]
}

const FLOOR_HEIGHT = 0.3
const HEX_RADIUS = 0.8

function createHexShape(radius: number) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return shape
}

function Floor({ task, y, color }: { task: Task; y: number; color: string }) {
  const ref = useRef<THREE.LineSegments>(null)
  const shape = createHexShape(HEX_RADIUS)
  const geo = new THREE.ExtrudeGeometry(shape, { depth: FLOOR_HEIGHT, bevelEnabled: false })
  const edges = new THREE.EdgesGeometry(geo)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const mat = ref.current.material as THREE.LineBasicMaterial
    if (task.status === 'doing') {
      mat.opacity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3
    } else if (task.status === 'review') {
      mat.color.setHex(Math.sin(clock.elapsedTime * 5) > 0 ? 0xffaa00 : parseInt(color.slice(1), 16))
    }
  })

  const isDashed = task.status === 'todo'
  const opacity = task.status === 'todo' ? 0.3 : task.status === 'done' ? 1 : 0.7

  return (
    <lineSegments ref={ref} geometry={edges} position={[0, y, 0]}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        {...(isDashed && { dashSize: 0.1, gapSize: 0.05 })}
      />
    </lineSegments>
  )
}

export function Building({ tasks, color, position }: BuildingProps) {
  const sorted = [...tasks].sort((a, b) => b.priority - a.priority)

  return (
    <group position={position}>
      {sorted.map((task, i) => (
        <Floor key={task.id} task={task} y={i * FLOOR_HEIGHT} color={color} />
      ))}
    </group>
  )
}
