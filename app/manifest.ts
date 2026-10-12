import type { MetadataRoute } from 'next'
import { tr } from '@/lib/i18n/tr'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${tr.site.name} · ${tr.site.tagline}`,
    short_name: tr.site.name,
    description: tr.site.description,
    lang: 'tr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f9fc',
    theme_color: '#2546b8',
    categories: ['lifestyle', 'business'],
    icons: [
      { src: '/icons/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Temizlik talebi aç', url: '/talep/yeni?modul=temizlik' },
      { name: 'Hizmet ver', url: '/hizmet-ver' },
    ],
  }
}
