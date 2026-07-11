import { redirect } from "next/navigation"
import { getRole } from "@/lib/auth"
import { getProjects } from "@/app/actions/projects"
import { Dashboard } from "@/components/dashboard"

export default async function HomePage() {
  const role = await getRole()
  if (!role) redirect("/login")

  const projects = await getProjects()

  return <Dashboard projects={projects} role={role} />
}
