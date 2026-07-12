"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { getRole } from "@/lib/auth"
import type { Project, Attachment, ChangeHistoryEntry, ProjectStatus } from "@/lib/types"

async function requireAdmin() {
  const role = await getRole()
  if (role !== "admin") throw new Error("No autorizado")
  return role
}

async function actorLabel() {
  const role = await getRole()
  return role === "admin" ? "Administrador" : "Visitante"
}

// ---------- Reads ----------

export async function getProjects(): Promise<Project[]> {
  const rows = await sql`
    SELECT p.id, p.name, p.status, p.responsables, p.notas, p.archived,
           p.deadline, p.updated_at, p.created_at,
           COALESCE(
             json_agg(
               json_build_object(
                 'id', a.id, 'projectId', a.project_id,
                 'url', a.url, 'descripcion', a.descripcion,
                 'createdAt', a.created_at
               ) ORDER BY a.created_at
             ) FILTER (WHERE a.id IS NOT NULL), '[]'
           ) AS attachments
    FROM projects p
    LEFT JOIN attachments a ON a.project_id = p.id
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `
  return rows.map((r: Record<string, unknown>) => ({
    id: r.id as number,
    name: r.name as string,
    status: r.status as ProjectStatus,
    responsables: (r.responsables as string[]) ?? [],
    notas: r.notas as string,
    archived: r.archived as boolean,
    deadline: r.deadline ? (r.deadline instanceof Date ? r.deadline.toISOString().slice(0, 10) : String(r.deadline).slice(0, 10)) : null,
    updatedAt: String(r.updated_at),
    createdAt: String(r.created_at),
    attachments: r.attachments as Attachment[],
  }))
}

export async function getHistory(projectId: number): Promise<ChangeHistoryEntry[]> {
  const rows = await sql`
    SELECT id, project_id, field, old_value, new_value, changed_by, changed_at
    FROM change_history
    WHERE project_id = ${projectId}
    ORDER BY changed_at DESC
  `
  return rows.map((r: Record<string, unknown>) => ({
    id: r.id as number,
    projectId: r.project_id as number,
    field: r.field as string,
    oldValue: (r.old_value as string) ?? null,
    newValue: (r.new_value as string) ?? null,
    changedBy: r.changed_by as string,
    changedAt: String(r.changed_at),
  }))
}

// ---------- Helpers ----------

async function logChange(
  projectId: number,
  field: string,
  oldValue: string | null,
  newValue: string | null,
  changedBy: string,
) {
  await sql`
    INSERT INTO change_history (project_id, field, old_value, new_value, changed_by)
    VALUES (${projectId}, ${field}, ${oldValue}, ${newValue}, ${changedBy})
  `
}

// ---------- Mutations ----------

export async function createProject(formData: FormData) {
  await requireAdmin()
  const actor = await actorLabel()

  const name = String(formData.get("name") ?? "").trim()
  const status = String(formData.get("status") ?? "No iniciado") as ProjectStatus
  const notas = String(formData.get("notas") ?? "").trim()
  const responsables = String(formData.get("responsables") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const deadlineRaw = String(formData.get("deadline") ?? "").trim()
  const deadline = deadlineRaw || null

  if (!name) throw new Error("El nombre es obligatorio")

  const links: { url: string; descripcion: string }[] = JSON.parse(
    String(formData.get("links") ?? "[]"),
  )

  const rows = await sql`
    INSERT INTO projects (name, status, responsables, notas, deadline)
    VALUES (${name}, ${status}, ${responsables}, ${notas}, ${deadline})
    RETURNING id
  `
  const id = rows[0].id as number

  for (const link of links) {
    if (!link.url) continue
    await sql`INSERT INTO attachments (project_id, url, descripcion) VALUES (${id}, ${link.url}, ${link.descripcion})`
  }

  await logChange(id, "Creación", null, `Proyecto "${name}" creado`, actor)
  revalidatePath("/")
}

export async function updateProject(formData: FormData) {
  await requireAdmin()
  const actor = await actorLabel()

  const id = Number(formData.get("id"))
  const name = String(formData.get("name") ?? "").trim()
  const status = String(formData.get("status") ?? "") as ProjectStatus
  const notas = String(formData.get("notas") ?? "").trim()
  const responsables = String(formData.get("responsables") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const links: { url: string; descripcion: string }[] = JSON.parse(
    String(formData.get("links") ?? "[]"),
  )

  const deadlineRaw = String(formData.get("deadline") ?? "").trim()
  const deadline = deadlineRaw || null

  const existing = await sql`SELECT name, status, responsables, notas, deadline FROM projects WHERE id = ${id}`
  if (existing.length === 0) throw new Error("Proyecto no encontrado")
  const prev = existing[0]

  if (prev.name !== name) await logChange(id, "Nombre", prev.name as string, name, actor)
  if (prev.status !== status) await logChange(id, "Estado", prev.status as string, status, actor)
  if (prev.notas !== notas) await logChange(id, "Notas", prev.notas as string, notas, actor)
  const prevResp = ((prev.responsables as string[]) ?? []).join(", ")
  const newResp = responsables.join(", ")
  if (prevResp !== newResp) await logChange(id, "Responsables", prevResp, newResp, actor)
  const prevDeadline = prev.deadline ? String(prev.deadline) : null
  if (prevDeadline !== deadline) await logChange(id, "Fecha límite", prevDeadline, deadline, actor)

  await sql`DELETE FROM attachments WHERE project_id = ${id}`
  for (const link of links) {
    if (!link.url) continue
    await sql`INSERT INTO attachments (project_id, url, descripcion) VALUES (${id}, ${link.url}, ${link.descripcion})`
  }

  await sql`
    UPDATE projects
    SET name = ${name}, status = ${status}, responsables = ${responsables},
        notas = ${notas}, deadline = ${deadline}, updated_at = now()
    WHERE id = ${id}
  `
  revalidatePath("/")
}

export async function setArchived(id: number, archived: boolean) {
  await requireAdmin()
  const actor = await actorLabel()
  await logChange(
    id,
    "Archivado",
    archived ? "Activo" : "Archivado",
    archived ? "Archivado" : "Activo",
    actor,
  )
  await sql`UPDATE projects SET archived = ${archived}, updated_at = now() WHERE id = ${id}`
  revalidatePath("/")
}

export async function addAttachment(formData: FormData) {
  await requireAdmin()
  const actor = await actorLabel()
  const projectId = Number(formData.get("projectId"))
  const url = String(formData.get("url") ?? "").trim()
  const descripcion = String(formData.get("descripcion") ?? "").trim()
  if (!url) throw new Error("La URL es obligatoria")

  await sql`
    INSERT INTO attachments (project_id, url, descripcion)
    VALUES (${projectId}, ${url}, ${descripcion})
  `
  await logChange(projectId, "Adjunto", null, `Agregado: ${descripcion || url}`, actor)
  await sql`UPDATE projects SET updated_at = now() WHERE id = ${projectId}`
  revalidatePath("/")
}

export async function removeAttachment(attachmentId: number, projectId: number) {
  await requireAdmin()
  const actor = await actorLabel()
  const rows = await sql`SELECT url, descripcion FROM attachments WHERE id = ${attachmentId}`
  const label = rows.length ? (rows[0].descripcion as string) || (rows[0].url as string) : ""
  await sql`DELETE FROM attachments WHERE id = ${attachmentId}`
  await logChange(projectId, "Adjunto", `Eliminado: ${label}`, null, actor)
  await sql`UPDATE projects SET updated_at = now() WHERE id = ${projectId}`
  revalidatePath("/")
}
