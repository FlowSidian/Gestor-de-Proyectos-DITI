"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { getRole } from "@/lib/auth"
import type { Responsable } from "@/lib/types"

async function requireAdmin() {
  const role = await getRole()
  if (role !== "admin") throw new Error("No autorizado")
}

export async function getResponsables(): Promise<Responsable[]> {
  const rows = await sql`
    SELECT id, nombre, created_at FROM responsables ORDER BY nombre
  `
  return rows.map((r: Record<string, unknown>) => ({
    id: r.id as number,
    name: r.nombre as string,
    createdAt: String(r.created_at),
  }))
}

export async function addResponsable(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get("name") ?? "").trim()
  if (!name) throw new Error("El nombre es obligatorio")

  const existing = await sql`SELECT id FROM responsables WHERE lower(nombre) = lower(${name})`
  if (existing.length > 0) throw new Error("Ya existe un responsable con ese nombre")

  await sql`INSERT INTO responsables (nombre) VALUES (${name})`
  revalidatePath("/")
}

export async function removeResponsable(id: number) {
  await requireAdmin()
  await sql`DELETE FROM responsables WHERE id = ${id}`
  revalidatePath("/")
}
