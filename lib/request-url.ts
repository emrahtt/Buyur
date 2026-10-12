export type RequestPrefill = {
  moduleSlug: string
  categorySlug?: string | null
  packageSlug?: string | null
  regionId?: number | null
  description?: string | null
  details?: Record<string, string | number | boolean>
}

export function buildRequestUrl(prefill: RequestPrefill) {
  const params = new URLSearchParams({ modul: prefill.moduleSlug })
  if (prefill.categorySlug) params.set('kategori', prefill.categorySlug)
  if (prefill.packageSlug) params.set('paket', prefill.packageSlug)
  if (prefill.regionId) params.set('bolge', String(prefill.regionId))
  if (prefill.description) params.set('aciklama', prefill.description)
  for (const [key, value] of Object.entries(prefill.details ?? {})) {
    params.set(`d_${key}`, String(value))
  }
  return `/talep/yeni?${params.toString()}`
}
