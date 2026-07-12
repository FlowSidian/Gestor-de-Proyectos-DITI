import { redirect } from "next/navigation"
import { getRole } from "@/lib/auth"
import { getProjects } from "@/app/actions/projects"
import { getResponsables } from "@/app/actions/responsables"
import { Dashboard } from "@/components/dashboard"

export default async function HomePage() {
  const role = await getRole()
  if (!role) redirect("/login")

  const [projects, responsables] = await Promise.all([getProjects(), getResponsables()])

  return <Dashboard projects={projects} role={role} responsables={responsables} />
}
