export function BlueprintBackground() {
  return (
    <>
      <ambientLight intensity={0.6} color="#ffffff" />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#666666" />
    </>
  )
}
