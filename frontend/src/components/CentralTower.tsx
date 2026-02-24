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
const HEX_RADIUS = 0.9

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

export function CentralTower({ project, maxHeight, onSelect }: CentralTowerProps) {
  const height = maxHeight + FLOOR_HEIGHT
  const [edges, geo] = useMemo(() => {
    const shape = createFlatTopHexShape(HEX_RADIUS)
    const g = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
    return [new THREE.EdgesGeometry(g), g]
  }, [height])

  return (
    <group>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={geo as any} onClick={onSelect}>
          <meshBasicMaterial color={project.color} transparent opacity={0.2} />
        </mesh>
        <lineSegments geometry={edges as any} onClick={onSelect}>
          <lineBasicMaterial color="#333333" opacity={0.9} transparent />
        </lineSegments>
      </group>
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.3}
        color={project.color}
        anchorX="center"
        anchorY="middle"
      >
        {project.name}
      </Text>
    </group>
  )
}
