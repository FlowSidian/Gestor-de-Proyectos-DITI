// Identidad visible de la app. Cada despliegue la sobreescribe con variables de
// entorno, así el mismo código sirve para varias direcciones. Los valores por
// defecto son los de la DITI.
export const ORG_NAME =
  process.env.NEXT_PUBLIC_ORG_NAME ?? "Dirección de Innovación y Tecnología"
export const ORG_SHORT = process.env.NEXT_PUBLIC_ORG_SHORT ?? "DITI"
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Gestión de Proyectos"

export const APP_TITLE = `${APP_NAME} | ${ORG_NAME}`
export const APP_SHORT_TITLE = `Proyectos ${ORG_SHORT}`
export const APP_DESCRIPTION = `Aplicación de gestión y seguimiento de proyectos de la ${ORG_NAME}.`
