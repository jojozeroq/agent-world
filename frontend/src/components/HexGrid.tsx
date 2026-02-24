import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { Building } from './Building'
import { CentralTower } from './CentralTower'
import { Text } from '@react-three/drei'
import type { Task, Project } from '../types'

interface HexGridProps {
  project: Project
  tasks: Task[]
  position: [number, number, number]
  onHexClick?: (category: string) => void
  onHexHover?: (category: string | null) => void
  onTowerClick?: () => void
}

const HEX_RADIUS = 1.2
const FLOOR_HEIGHT = 0.3

const DEFAULT_CATEGORIES = [
  { id: 'research', label: '调研' },
  { id: 'frontend', label: '前端' },
  { id: 'backend', label: '后端' },
  { id: 'design', label: '设计' },
  { id: 'docs', label: '文档' },
  { id: 'testing', label: '测试' },
]

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

// Flat-top hex: edge-to-edge touching positions for ring 1
function hexRing1(radius: number): [number, number][] {
  const sqrt3 = Math.sqrt(3)
  return [
    [1.5 * radius, sqrt3 / 2 * radius],   // right-up
    [0, sqrt3 * radius],                   // up
    [-1.5 * radius, sqrt3 / 2 * radius],  // left-up
    [-1.5 * radius, -sqrt3 / 2 * radius], // left-down
    [0, -sqrt3 * radius],                  // down
    [1.5 * radius, -sqrt3 / 2 * radius],  // right-down
  ]
}

export function HexGrid({ project, tasks, position, onHexClick, onHexHover, onTowerClick }: HexGridProps) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null)

  const tasksByCategory = useMemo(() => {
    const map = new Map<string, Task[]>()
    tasks.forEach(t => {
      const c = t.category || 'general'
      if (!map.has(c)) map.set(c, [])
      map.get(c)!.push(t)
    })
    return map
  }, [tasks])

  const maxHeight = useMemo(() => {
    let max = 0
    tasksByCategory.forEach(catTasks => {
      const h = catTasks.length * FLOOR_HEIGHT
      if (h > max) max = h
    })
    return max
  }, [tasksByCategory])

  const hexShape = useMemo(() => createFlatTopHexShape(HEX_RADIUS), [])
  const hexGeo = useMemo(() => new THREE.ExtrudeGeometry(hexShape, { depth: 0.08, bevelEnabled: false }), [hexShape])
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(hexGeo), [hexGeo])
  const ring1 = useMemo(() => hexRing1(HEX_RADIUS), [])

  return (
    <group position={position}>
      {/* Central tower */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={hexGeo as any} onClick={onTowerClick}>
          <meshBasicMaterial color={project.color} transparent opacity={0.25} />
        </mesh>
        <lineSegments geometry={edgesGeo as any}>
          <lineBasicMaterial color="#333333" />
        </lineSegments>
      </group>
      <CentralTower project={project} maxHeight={maxHeight} onSelect={onTowerClick} />

      {/* Category hexes — always show all 6 defaults */}
      {DEFAULT_CATEGORIES.map((cat, i) => {
        const [x, z] = ring1[i]
        const catTasks = tasksByCategory.get(cat.id) || []
        return (
          <group key={cat.id} position={[x, 0, z]}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <mesh
                geometry={hexGeo as any}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  setHoveredCat(cat.id)
                  document.body.style.cursor = 'pointer'
                  onHexHover?.(cat.id)
                }}
                onPointerOut={() => {
                  setHoveredCat(null)
                  document.body.style.cursor = 'default'
                  onHexHover?.(null)
                }}
                onClick={(e) => { e.stopPropagation(); onHexClick?.(cat.id) }}
              >
                <meshBasicMaterial color={project.color} transparent opacity={catTasks.length > 0 ? 0.15 : 0.05} />
              </mesh>
              <lineSegments geometry={edgesGeo as any}>
                <lineBasicMaterial color={hoveredCat === cat.id ? '#666666' : '#333333'} />
              </lineSegments>
            </group>
            {/* Category label */}
            <Text position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.25} color="#666666" anchorX="center" anchorY="middle">
              {cat.label}
            </Text>
            {catTasks.length > 0 && (
              <Building tasks={catTasks} color={project.color} position={[0, 0.08, 0]} />
            )}
          </group>
        )
      })}
    </group>
  )
}
