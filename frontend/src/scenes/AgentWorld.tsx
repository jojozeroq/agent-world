import { useMemo, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { BlueprintBackground } from '../components/BlueprintBackground'
import { HexGrid } from '../components/HexGrid'
import { AgentOrbs } from '../components/AgentOrbs'
import { useStore } from '../store/useStore'

export function AgentWorld() {
  const { projects, tasks, agents, activities, subscribe, setSelectedProject, setHoveredHex } = useStore()

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
            onHexClick={(cat) => setSelectedProject(`${project.id}:${cat}`)}
            onHexHover={(cat) => setHoveredHex(cat ? `${project.id}:${cat}` : null)}
            onTowerClick={() => setSelectedProject(project.id)}
          />
        )
      })}
      <AgentOrbs agents={agents} activities={activities} tasks={tasks} />
      <OrbitControls enableDamping dampingFactor={0.08} />
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.3} />
      </EffectComposer>
    </>
  )
}
