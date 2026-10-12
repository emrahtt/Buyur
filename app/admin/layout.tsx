import type { Metadata } from 'next'
import { AdminNav } from '@/components/admin/admin-nav'
import { SiteHeader } from '@/components/site/site-header'
import { ROLE_LABELS, staffRole } from '@/lib/roles'
import { requireStaff } from '@/lib/session'

export const metadata: Metadata = { title: 'Yönetim', robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff()
  const role = staffRole(session.user) ?? 'supervisor'
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{ROLE_LABELS[role]}</span> olarak giriş yaptın
          </p>
          <AdminNav role={role} />
        </div>
        {children}
      </main>
    </>
  )
}
