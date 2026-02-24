import { useMemo } from 'react'
import * as THREE from 'three'
import { Building } from './Building'
import { CentralTower } from './CentralTower'
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
const HEX_GAP = 0.15

function createFlatTopHexShape(radius: number) {
  const shape = new THREE.Shape()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6 // flat-top offset
    const x = radius * Math.cos(angle)
    const y = radius * Math.sin(angle)
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return shape
}

// Flat-top hex ring positions (axial coords → world)
function hexRingPositions(ring: number, radius: number): [number, number][] {
  if (ring === 0) return [[0, 0]]
  const positions: [number, number][] = []
  const w = (radius + HEX_GAP) * 2
  const h = (radius + HEX_GAP) * Math.sqrt(3)
  // 6 directions for flat-top hex
  const dirs: [number, number][] = [[w * 0.75, h * 0.5], [0, h], [-w * 0.75, h * 0.5], [-w * 0.75, -h * 0.5], [0, -h], [w * 0.75, -h * 0.5]]
  let [x, z] = [ring * w * 0.75, -ring * h * 0.5]
  for (let d = 0; d < 6; d++) {
    for (let s = 0; s < ring; s++) {
      positions.push([x, z])
      x += dirs[(d + 2) % 6][0]
      z += dirs[(d + 2) % 6][1]
    }
  }
  return positions
}

const FLOOR_HEIGHT = 0.3

export function HexGrid({ project, tasks, position, onHexClick, onHexHover, onTowerClick }: HexGridProps) {
  const categories = useMemo(() => {
    const cats = new Map<string, Task[]>()
    tasks.forEach(t => {
      const c = t.category || 'general'
      if (!cats.has(c)) cats.set(c, [])
      cats.get(c)!.push(t)
    })
    return Array.from(cats.entries())
  }, [tasks])

  const maxHeight = useMemo(() => {
    let max = 0
    categories.forEach(([, catTasks]) => {
      const h = catTasks.length * FLOOR_HEIGHT
      if (h > max) max = h
    })
    return max
  }, [categories])

  const hexShape = useMemo(() => createFlatTopHexShape(HEX_RADIUS), [])
  const hexGeo = useMemo(() => new THREE.ExtrudeGeometry(hexShape, { depth: 0.08, bevelEnabled: false }), [hexShape])
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(hexGeo), [hexGeo])

  // Ring 0 = center (central tower), ring 1 = categories
  const ring1 = hexRingPositions(1, HEX_RADIUS)

  return (
    <group position={position}>
      <CentralTower project={project} maxHeight={maxHeight} onSelect={onTowerClick} />

      {/* Category hexes + buildings */}
      {categories.map(([category, catTasks], i) => {
        const pos = ring1[i % ring1.length]
        return (
          <group key={category} position={[pos[0], 0, pos[1]]}>
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <lineSegments
                geometry={edgesGeo as any}
                onPointerOver={() => onHexHover?.(category)}
                onPointerOut={() => onHexHover?.(null)}
                onClick={() => onHexClick?.(category)}
              >
                <lineBasicMaterial color={project.color} />
              </lineSegments>
            </group>
            <Building tasks={catTasks} color={project.color} position={[0, 0.08, 0]} />
          </group>
        )
      })}
    </group>
  )
}
