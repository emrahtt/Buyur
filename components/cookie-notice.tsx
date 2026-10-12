'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'

const COOKIE = 'buyur_cerez=1'

const EVENT = 'buyur:cookie'

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  return () => window.removeEventListener(EVENT, onChange)
}

/**
 * Buyur only sets strictly-necessary cookies (session) and cookieless analytics,
 * so this is an information notice, not a consent wall.
 */
export function CookieNotice() {
  const seen = useSyncExternalStore(
    subscribe,
    () => document.cookie.includes(COOKIE),
    () => true,
  )
  if (seen) return null

  function dismiss() {
    document.cookie = `${COOKIE}; max-age=31536000; path=/; samesite=lax`
    window.dispatchEvent(new Event(EVENT))
  }

  return (
    <div
      role="region"
      aria-label="Çerez bildirimi"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-lg pb-safe sm:inset-x-auto sm:right-4"
    >
      <p className="text-sm leading-relaxed text-pretty">
        Yalnızca oturumun için zorunlu çerezleri kullanıyoruz; reklam çerezi yok.{' '}
        <Link href="/cerez" className="font-medium text-primary underline underline-offset-4">
          Çerez politikası
        </Link>
      </p>
      <Button onClick={dismiss} className="self-end">
        Anladım
      </Button>
    </div>
  )
}
