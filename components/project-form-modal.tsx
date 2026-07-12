"use client"

import { useState, useTransition } from "react"
import { Plus, X, ExternalLink } from "lucide-react"
import type { Project, Responsable } from "@/lib/types"
import { PROJECT_STATUSES } from "@/lib/types"
import { createProject, updateProject } from "@/app/actions/projects"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"

interface LinkEntry {
  url: string
  descripcion: string
}

export function ProjectFormModal({
  project,
  responsables,
  onClose,
}: {
  project: Project | null
  responsables: Responsable[]
  onClose: () => void
}) {
  const isEdit = Boolean(project)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const [selectedResponsables, setSelectedResponsables] = useState<string[]>(
    project?.responsables ?? [],
  )

  const [links, setLinks] = useState<LinkEntry[]>(
    project?.attachments.map((a) => ({ url: a.url, descripcion: a.descripcion })) ?? [],
  )
  const [linkUrl, setLinkUrl] = useState("")
  const [linkDesc, setLinkDesc] = useState("")

  const toggleResponsable = (name: string) => {
    setSelectedResponsables((prev) =>
      prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name],
    )
  }

  const addLink = () => {
    const url = linkUrl.trim()
    if (!url) return
    setLinks((prev) => [...prev, { url, descripcion: linkDesc.trim() }])
    setLinkUrl("")
    setLinkDesc("")
  }

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (formData: FormData) => {
    setError("")
    formData.set("responsables", selectedResponsables.join(","))
    formData.set("links", JSON.stringify(links))
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

        {/* Multi-select de responsables */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Responsables</span>
          {responsables.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No hay responsables registrados. Agregalos desde la configuración.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-background p-2">
              {responsables.map((r) => {
                const selected = selectedResponsables.includes(r.name)
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleResponsable(r.name)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {r.name}
                  </button>
                )
              })}
            </div>
          )}
          {selectedResponsables.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              {selectedResponsables.length} seleccionado{selectedResponsables.length !== 1 ? "s" : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notas" className="text-sm font-medium text-foreground">
            Notas adicionales
          </label>
          <textarea
            id="notas"
            name="notas"
            rows={3}
            defaultValue={project?.notas ?? ""}
            placeholder="Detalles, contexto o próximos pasos del proyecto"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </div>

        {/* Sección de enlaces */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Enlaces adjuntos</span>

          {links.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {links.map((link, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2 text-sm">
                    <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate text-foreground">
                      {link.descripcion || link.url}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="link-url" className="mb-1 block text-xs text-muted-foreground">
                URL
              </label>
              <input
                id="link-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="link-desc" className="mb-1 block text-xs text-muted-foreground">
                Descripción
              </label>
              <input
                id="link-desc"
                value={linkDesc}
                onChange={(e) => setLinkDesc(e.target.value)}
                placeholder="Ej. Documento en Drive"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
              />
            </div>
            <Button type="button" variant="outline" onClick={addLink} disabled={!linkUrl.trim()}>
              <Plus />
              Añadir
            </Button>
          </div>
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
