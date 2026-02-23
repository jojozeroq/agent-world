import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import type { Project } from '../types'

interface CentralTowerProps {
  project: Project
  maxHeight: number
  onSelect?: () => void
}

const FLOOR_HEIGHT = 0.3
const HEX_RADIUS = 0.8

function createHexShape(radius: number) {
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

export function CentralTower({ project, maxHeight, onSelect }: CentralTowerProps) {
  const height = maxHeight + FLOOR_HEIGHT
  const shape = useMemo(() => createHexShape(HEX_RADIUS), [])
  const geo = useMemo(() => new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false }), [shape, height])
  const edges = useMemo(() => new THREE.EdgesGeometry(geo), [geo])

  return (
    <group>
      <lineSegments geometry={edges} onClick={onSelect}>
        <lineBasicMaterial color={project.color} opacity={0.9} transparent />
      </lineSegments>
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.25}
        color={project.color}
        anchorX="center"
        anchorY="middle"
      >
        {project.name}
      </Text>
    </group>
  )
}
