import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface AgentNodeProps {
  id: string
  name: string
  emoji: string
  color: string
  position: [number, number, number]
  phase?: number
}

export function AgentNode({ name, position, phase = 0 }: AgentNodeProps) {
  const ref = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const targetScale = hovered ? 1.2 : 1.0

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.2 + phase) * 0.15
      ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
    >
      <mesh>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial wireframe color="#333" />
      </mesh>

      <Text
        position={[0, -0.65, 0]}
        fontSize={0.22}
        color="#000"
        anchorX="center"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2"
      >
        {name}
      </Text>
    </group>
  )
}
