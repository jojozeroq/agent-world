import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sprite } from '@react-three/drei'
import * as THREE from 'three'

interface AgentNodeProps {
  id: string
  name: string
  emoji: string
  color: string
  position: [number, number, number]
  phase?: number
}

export function AgentNode({ name, color, position, phase = 0 }: AgentNodeProps) {
  const ref = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Sprite>(null)
  const [hovered, setHovered] = useState(false)
  const targetScale = hovered ? 1.2 : 1.0

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 1.2 + phase) * 0.15
      ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.4 + Math.sin(clock.elapsedTime * 2 + phase) * 0.2
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
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      <Sprite ref={glowRef} scale={[1.8, 1.8, 1]}>
        <spriteMaterial
          color={color}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sprite>

      <Text
        position={[0, -0.65, 0]}
        fontSize={0.22}
        color="rgba(255,255,255,0.87)"
        anchorX="center"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2"
      >
        {name}
      </Text>
    </group>
  )
}
