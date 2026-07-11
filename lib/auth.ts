import { cookies } from "next/headers"
import type { Role } from "./types"

const COOKIE_NAME = "dit_role"

// Contraseñas por rol. Se pueden sobreescribir con variables de entorno.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin2024"
const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD ?? "visitante2024"

export function checkPassword(password: string): Role | null {
  if (password === ADMIN_PASSWORD) return "admin"
  if (password === VIEWER_PASSWORD) return "visitante"
  return null
}

export async function getRole(): Promise<Role | null> {
  const store = await cookies()
  const value = store.get(COOKIE_NAME)?.value
  if (value === "admin" || value === "visitante") return value
  return null
}

export async function setRole(role: Role) {
  const store = await cookies()
  store.set(COOKIE_NAME, role, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearRole() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
