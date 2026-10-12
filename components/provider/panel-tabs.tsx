import Link from 'next/link'
import { cn } from '@/lib/utils'

export type PanelTab = 'talepler' | 'teklifler' | 'bildirimler'

export function PanelTabs({ active, unread }: { active: PanelTab; unread: number }) {
  const tabs: { id: PanelTab; label: string; badge?: number }[] = [
    { id: 'talepler', label: 'Açık talepler' },
    { id: 'teklifler', label: 'Tekliflerim' },
    { id: 'bildirimler', label: 'Bildirimler', badge: unread },
  ]
  return (
    <nav aria-label="Panel bölümleri" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex min-w-max gap-1 rounded-xl bg-secondary p-1">
        {tabs.map((tab) => (
          <li key={tab.id} className="flex-1">
            <Link
              href={`/veren?sekme=${tab.id}`}
              aria-current={active === tab.id ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors',
                active === tab.id ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {tab.badge ? (
                <span className="flex min-w-5 items-center justify-center rounded-full bg-tea px-1.5 text-xs font-bold text-tea-foreground">
                  {tab.badge}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
