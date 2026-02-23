import { useMemo, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { BlueprintBackground } from '../components/BlueprintBackground'
import { HexGrid } from '../components/HexGrid'
import { AgentOrbs } from '../components/AgentOrbs'
import { BridgeHex } from '../components/BridgeHex'
import { useStore } from '../store/useStore'

export function AgentWorld() {
  const { projects, tasks, agents, activities, relations, subscribe } = useStore()

  useEffect(() => {
    const unsub = subscribe()
    return unsub
  }, [subscribe])

  const projectsWithTasks = useMemo(() => {
    return projects.map(p => ({
      ...p,
      tasks: tasks.filter(t => t.project_id === p.id),
    }))
  }, [projects, tasks])

  const bridges = useMemo(() => {
    const result: Array<{ projectA: typeof projects[0], projectB: typeof projects[0], hasRelation: boolean, position: [number, number, number] }> = []
    for (let i = 0; i < projects.length; i++) {
      const x1 = (i % 3) * 12 - 12
      const z1 = Math.floor(i / 3) * 12 - 6
      if (i % 3 < 2) {
        const j = i + 1
        if (j < projects.length) {
          const x2 = (j % 3) * 12 - 12
          const z2 = Math.floor(j / 3) * 12 - 6
          const hasRelation = relations.some(r =>
            (r.project_a_id === projects[i].id && r.project_b_id === projects[j].id) ||
            (r.project_a_id === projects[j].id && r.project_b_id === projects[i].id)
          )
          result.push({ projectA: projects[i], projectB: projects[j], hasRelation, position: [(x1 + x2) / 2, 0, (z1 + z2) / 2] })
        }
      }
    }
    return result
  }, [projects, relations])

  return (
    <>
      <BlueprintBackground />
      {projectsWithTasks.map((project, i) => {
        const x = (i % 3) * 12 - 12
        const z = Math.floor(i / 3) * 12 - 6
        return (
          <HexGrid
            key={project.id}
            project={project}
            tasks={project.tasks}
            position={[x, 0, z]}
          />
        )
      })}
      {bridges.map((b, i) => (
        <BridgeHex key={i} projectA={b.projectA} projectB={b.projectB} hasRelation={b.hasRelation} position={b.position} />
      ))}
      <AgentOrbs agents={agents} activities={activities} tasks={tasks} />
      <OrbitControls enableDamping dampingFactor={0.08} />
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.3} />
      </EffectComposer>
    </>
  )
}
