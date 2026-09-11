import type { MetadataRoute } from 'next'
import { APP_DESCRIPTION, APP_NAME, APP_SHORT_TITLE, ORG_SHORT } from '@/lib/branding'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} - ${ORG_SHORT}`,
    short_name: APP_SHORT_TITLE,
    description: APP_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#1a2233',
    theme_color: '#3b5998',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
