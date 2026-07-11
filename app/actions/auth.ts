"use server"

import { redirect } from "next/navigation"
import { checkPassword, setRole, clearRole } from "@/lib/auth"

export async function login(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "")
  const role = checkPassword(password)
  if (!role) {
    return { error: "Contraseña incorrecta. Verifica e intenta de nuevo." }
  }
  await setRole(role)
  redirect("/")
}

export async function logout() {
  await clearRole()
  redirect("/login")
}
