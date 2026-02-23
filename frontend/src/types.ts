export interface Project {
  id: string
  name: string
  status: string
  color: string
  owner_agent_id: string
}

export interface Task {
  id: string
  title: string
  status: 'todo' | 'doing' | 'review' | 'done'
  priority: number
  category: string
  assignee_id: string
  project_id: string
}

export interface Agent {
  id: string
  name: string
  emoji: string
  role: string
  status: 'online' | 'idle' | 'offline'
}

export interface Activity {
  id: string
  agent_id: string
  action: string
  summary: string
  created_at: string
}

export interface ProjectRelation {
  project_a_id: string
  project_b_id: string
}
