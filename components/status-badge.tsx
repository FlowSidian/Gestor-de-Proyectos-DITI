import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/lib/types"

const styles: Record<ProjectStatus, string> = {
  Completado:
    "bg-[oklch(0.92_0.06_150)] text-[oklch(0.35_0.09_150)] dark:bg-[oklch(0.35_0.07_150)] dark:text-[oklch(0.9_0.08_150)]",
  "En curso":
    "bg-[oklch(0.93_0.05_240)] text-[oklch(0.4_0.11_240)] dark:bg-[oklch(0.38_0.08_240)] dark:text-[oklch(0.9_0.07_240)]",
  "No iniciado":
    "bg-muted text-muted-foreground",
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        styles[status],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  )
}
