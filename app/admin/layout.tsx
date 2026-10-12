import type { Metadata } from 'next'
import { AdminNav } from '@/components/admin/admin-nav'
import { SiteHeader } from '@/components/site/site-header'
import { requireAdmin } from '@/lib/session'

export const metadata: Metadata = { title: 'Yönetim', robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        <AdminNav />
        {children}
      </main>
    </>
  )
}
