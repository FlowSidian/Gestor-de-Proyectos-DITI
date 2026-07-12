export type ProjectStatus = "Completado" | "En curso" | "No iniciado"

export const PROJECT_STATUSES: ProjectStatus[] = ["No iniciado", "En curso", "Completado"]

export type Role = "admin" | "visitante"

export interface Attachment {
  id: number
  projectId: number
  url: string
  descripcion: string
  createdAt: string
}

export interface Project {
  id: number
  name: string
  status: ProjectStatus
  responsables: string[]
  notas: string
  archived: boolean
  updatedAt: string
  createdAt: string
  attachments: Attachment[]
}

export interface ChangeHistoryEntry {
  id: number
  projectId: number
  field: string
  oldValue: string | null
  newValue: string | null
  changedBy: string
  changedAt: string
}

export interface Responsable {
  id: number
  name: string
  createdAt: string
}
