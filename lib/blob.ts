import { get, put } from '@vercel/blob'
import { nanoid } from 'nanoid'
import { NextResponse } from 'next/server'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/heic', 'heic'],
  ['image/heif', 'heif'],
])

export function validateImage(file: unknown): { ok: true; file: File; ext: string } | { ok: false; error: string } {
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Dosya seçilmedi.' }
  const ext = ALLOWED.get(file.type)
  if (!ext) return { ok: false, error: 'Yalnızca JPG, PNG, WEBP ya da HEIC fotoğraf yükleyebilirsin.' }
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: 'Fotoğraf 5 MB’den küçük olmalı.' }
  return { ok: true, file, ext }
}

export async function putPrivateImage(prefix: string, file: File, ext: string) {
  const blob = await put(`${prefix}/${nanoid()}.${ext}`, file, {
    access: 'private',
    contentType: file.type,
  })
  return blob.pathname
}

export async function streamPrivateBlob(pathname: string, request: Request) {
  const result = await get(pathname, {
    access: 'private',
    ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
  })
  if (!result) return new NextResponse('Not found', { status: 404 })
  if (result.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: result.blob.etag, 'Cache-Control': 'private, no-cache' },
    })
  }
  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType,
      ETag: result.blob.etag,
      'Cache-Control': 'private, no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
