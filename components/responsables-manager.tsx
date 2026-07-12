"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, Users } from "lucide-react"
import type { Responsable } from "@/lib/types"
import { addResponsable, removeResponsable } from "@/app/actions/responsables"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

const fieldClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"

export function ResponsablesManager({
  responsables,
  onClose,
}: {
  responsables: Responsable[]
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const handleAdd = (formData: FormData) => {
    setError("")
    startTransition(async () => {
      try {
        await addResponsable(formData)
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al agregar")
      }
    })
  }

  const handleRemove = (id: number) => {
    startTransition(async () => {
      await removeResponsable(id)
      onClose()
    })
  }

  return (
    <Modal open onClose={onClose} title="Gestionar responsables" description="Agrega o elimina personas de la lista maestra de responsables.">
      <div className="flex flex-col gap-4">
        <form action={handleAdd} className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="resp-name" className="mb-1 block text-xs text-muted-foreground">
              Nombre
            </label>
            <input
              id="resp-name"
              name="name"
              required
              placeholder="Ej. Ana García"
              className={fieldClass}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            <Plus />
            Agregar
          </Button>
        </form>

        {error ? (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-1">
          {responsables.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Users className="size-8" />
              <p className="text-sm">No hay responsables registrados.</p>
            </div>
          ) : (
            responsables.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
              >
                <span className="text-sm text-foreground">{r.name}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemove(r.id)}
                  disabled={isPending}
                  aria-label={`Eliminar ${r.name}`}
                >
                  <Trash2 />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  )
}
