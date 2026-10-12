'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { StaffRole } from '@/lib/roles'
import { cn } from '@/lib/utils'

const LINKS: { href: string; label: string; adminOnly?: boolean }[] = [
  { href: '/admin', label: 'Genel bakış' },
  { href: '/admin/talepler', label: 'Talepler' },
  { href: '/admin/verenler', label: 'Hizmet verenler' },
  { href: '/admin/yorumlar', label: 'Yorumlar' },
  { href: '/admin/bekleme', label: 'Bekleme listesi' },
  { href: '/admin/kullanicilar', label: 'Kullanıcılar', adminOnly: true },
  { href: '/admin/bolgeler', label: 'Bölgeler', adminOnly: true },
]

export function AdminNav({ role }: { role: StaffRole }) {
  const pathname = usePathname()
  const visible = LINKS.filter((link) => role === 'admin' || !link.adminOnly)
  return (
    <nav aria-label="Yönetim" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex min-w-max gap-1 border-b">
        {visible.map((link) => {
          const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  '-mb-px flex min-h-11 items-center border-b-2 px-3 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
