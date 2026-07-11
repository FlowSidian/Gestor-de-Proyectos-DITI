"use client"

import { useState, useTransition } from "react"
import type { Project } from "@/lib/types"
import { PROJECT_STATUSES } from "@/lib/types"
import { createProject, updateProject } from "@/app/actions/projects"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"

export function ProjectFormModal({
  project,
  onClose,
}: {
  project: Project | null
  onClose: () => void
}) {
  const isEdit = Boolean(project)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const handleSubmit = (formData: FormData) => {
    setError("")
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateProject(formData)
        } else {
          await createProject(formData)
        }
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ocurrió un error al guardar")
      }
    })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Editar proyecto" : "Nuevo proyecto"}
      description={
        isEdit
          ? "Los cambios quedan registrados automáticamente en el historial."
          : "Completa la información del nuevo proyecto."
      }
    >
      <form action={handleSubmit} className="flex flex-col gap-4">
        {isEdit ? <input type="hidden" name="id" value={project!.id} /> : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Nombre del proyecto
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={project?.name ?? ""}
            placeholder="Ej. Portal de Servicios Ciudadanos"
            className={fieldClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-sm font-medium text-foreground">
              Estado
            </label>
            <select
              id="status"
              name="status"
              defaultValue={project?.status ?? "No iniciado"}
              className={fieldClass}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="responsables" className="text-sm font-medium text-foreground">
              Responsables
            </label>
            <input
              id="responsables"
              name="responsables"
              defaultValue={project?.responsables.join(", ") ?? ""}
              placeholder="Separa con comas: Ana, Luis"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notas" className="text-sm font-medium text-foreground">
            Notas adicionales
          </label>
          <textarea
            id="notas"
            name="notas"
            rows={4}
            defaultValue={project?.notas ?? ""}
            placeholder="Detalles, contexto o próximos pasos del proyecto"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear proyecto"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
