'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { markNotificationsRead } from '@/app/actions/provider'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

type Note = { id: number; title: string; href: string | null; read: boolean; createdAt: Date }

export function NotificationList({ items }: { items: Note[] }) {
  const hasUnread = items.some((n) => !n.read)
  useEffect(() => {
    if (hasUnread) void markNotificationsRead()
  }, [hasUnread])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center">
        <Bell aria-hidden="true" className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Bildirim yok. Yeni talepler burada görünecek.</p>
      </div>
    )
  }
  return (
    <ul className="flex flex-col divide-y rounded-xl border bg-card">
      {items.map((n) => (
        <li key={n.id}>
          <Link href={n.href ?? '/veren'} className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-muted/50">
            <span
              aria-hidden="true"
              className={cn('size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-tea')}
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className={cn('text-sm', !n.read && 'font-semibold')}>{n.title}</span>
              <span className="text-xs text-muted-foreground">{timeAgo(new Date(n.createdAt))}</span>
            </span>
            {!n.read ? <span className="sr-only">Okunmadı</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}
