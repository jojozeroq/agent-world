import { Grid } from '@react-three/drei'

export function BlueprintBackground() {
  return (
    <>
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={0.6} color="#ffffff" />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#666666" />
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#cccccc"
        sectionSize={5}
        sectionThickness={0.6}
        sectionColor="#aaaaaa"
        fadeDistance={50}
        fadeStrength={1}
        position={[0, -0.01, 0]}
      />
    </>
  )
}
