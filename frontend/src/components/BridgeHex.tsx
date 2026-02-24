import { useMemo } from 'react'
import * as THREE from 'three'
import type { Project } from '../types'

interface BridgeHexProps {
  projectA: Project
  projectB: Project
  hasRelation: boolean
  position: [number, number, number]
}

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

export function BridgeHex({ projectA, projectB, hasRelation, position }: BridgeHexProps) {
  const fillColor = useMemo(() => {
    if (!hasRelation) return '#444444'
    const colorA = new THREE.Color(projectA.color)
    const colorB = new THREE.Color(projectB.color)
    return '#' + colorA.lerp(colorB, 0.5).getHexString()
  }, [projectA.color, projectB.color, hasRelation])

  const hexShape = useMemo(() => createFlatTopHexShape(0.8), [])
  const hexGeo = useMemo(() => new THREE.ExtrudeGeometry(hexShape, { depth: 0.05, bevelEnabled: false }), [hexShape])
  const edgesGeo = useMemo(() => new THREE.EdgesGeometry(hexGeo), [hexGeo])

  return (
    <group position={position}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={hexGeo as any}>
          <meshBasicMaterial color={fillColor} transparent opacity={0.2} />
        </mesh>
        <lineSegments geometry={edgesGeo as any}>
          <lineBasicMaterial color="#333333" />
        </lineSegments>
      </group>
    </group>
  )
}
