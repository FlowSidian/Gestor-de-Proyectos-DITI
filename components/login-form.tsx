"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { login } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Verificando..." : "Ingresar"}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, { error: "" as string })

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Contraseña de acceso
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Introduce tu contraseña"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Introduce la contraseña de Administrador o de Visitante según tu rol.
          </p>
        </div>

        {state?.error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}

        <SubmitButton />
      </form>
    </div>
  )
}
