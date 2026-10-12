import { brandIcon } from '@/lib/brand-icon'

const SIZES: Record<string, { size: number; maskable?: boolean }> = {
  '192': { size: 192 },
  '512': { size: 512 },
  maskable: { size: 512, maskable: true },
}

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params
  const spec = SIZES[size]
  if (!spec) return new Response('Not found', { status: 404 })
  const image = brandIcon(spec.size, { maskable: spec.maskable })
  image.headers.set('Cache-Control', 'public, max-age=86400, immutable')
  return image
}
