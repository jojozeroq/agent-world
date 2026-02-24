import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Project, Task, Agent, Activity, ProjectRelation } from '../types'

interface Store {
  projects: Project[]
  tasks: Task[]
  agents: Agent[]
  activities: Activity[]
  relations: ProjectRelation[]
  selectedProject: string | null
  selectedTask: string | null
  hoveredHex: string | null
  setSelectedProject: (id: string | null) => void
  setSelectedTask: (id: string | null) => void
  setHoveredHex: (id: string | null) => void
  fetchAll: () => Promise<void>
  subscribe: () => () => void
}

export const useStore = create<Store>((set) => ({
  projects: [],
  tasks: [],
  agents: [],
  activities: [],
  relations: [],
  selectedProject: null,
  selectedTask: null,
  hoveredHex: null,
  setSelectedProject: (id) => set({ selectedProject: id }),
  setSelectedTask: (id) => set({ selectedTask: id }),
  setHoveredHex: (id) => set({ hoveredHex: id }),
  fetchAll: async () => {
    try {
      const [projects, tasks, agents, activities, relations] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('agents').select('*'),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('project_relations').select('*'),
      ])
      set({
        projects: projects.data || [],
        tasks: tasks.data || [],
        agents: agents.data || [],
        activities: activities.data || [],
        relations: relations.data || [],
      })
    } catch (err) {
      console.error('[AgentWorld] Failed to fetch data')
    }
  },
  subscribe: () => {
    const tasksSub = supabase.channel('tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
      set((state) => {
        if (payload.eventType === 'INSERT') return { tasks: [...state.tasks, payload.new as Task] }
        if (payload.eventType === 'UPDATE') return { tasks: state.tasks.map(t => t.id === payload.new.id ? payload.new as Task : t) }
        if (payload.eventType === 'DELETE') return { tasks: state.tasks.filter(t => t.id !== payload.old.id) }
        return state
      })
    }).subscribe()

    const activitiesSub = supabase.channel('activities').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, (payload) => {
      set((state) => ({ activities: [payload.new as Activity, ...state.activities].slice(0, 50) }))
    }).subscribe()

    const agentsSub = supabase.channel('agents').on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, (payload) => {
      set((state) => {
        if (payload.eventType === 'UPDATE') return { agents: state.agents.map(a => a.id === payload.new.id ? payload.new as Agent : a) }
        return state
      })
    }).subscribe()

    return () => {
      tasksSub.unsubscribe()
      activitiesSub.unsubscribe()
      agentsSub.unsubscribe()
    }
  },
}))
