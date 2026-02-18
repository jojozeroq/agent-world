import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface AgentNodeProps {
  id: string
  name: string
  emoji: string
  color: string
  position: [number, number, number]
}

export function AgentNode({ name, color, position }: AgentNodeProps) {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.5) * 0.1
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* 简笔画圆形头部 */}
      <mesh>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <lineLoop>
        <circleGeometry args={[0.4, 32]} />
        <lineBasicMaterial color={color} linewidth={2} />
      </lineLoop>

      {/* 名字 */}
      <Text position={[0, -0.7, 0]} fontSize={0.25} color="#333" anchorX="center">
        {name}
      </Text>
    </group>
  )
}
