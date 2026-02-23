import { Grid } from '@react-three/drei'

export function BlueprintBackground() {
  return (
    <>
      <color attach="background" args={['#0A1628']} />
      <ambientLight intensity={0.3} color="#4488cc" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#88ccff" />
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1A3050"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#2A4060"
        fadeDistance={50}
        fadeStrength={1}
        position={[0, -0.01, 0]}
      />
    </>
  )
}
