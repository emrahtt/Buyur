import { desc, eq, ilike, or } from 'drizzle-orm'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { UserRoleSelect } from '@/components/admin/user-role-select'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'
import { providerProfiles, user } from '@/lib/db/schema'
import { displayPhone } from '@/lib/format'
import { isAdminEmail, isDemoEmail, ROLE_LABELS, staffRole, type Role } from '@/lib/roles'
import { requireAdmin } from '@/lib/session'
import { cn } from '@/lib/utils'

const FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'staff', label: 'Ekip' },
  { id: 'provider', label: 'Hizmet veren' },
  { id: 'customer', label: 'Müşteri' },
]

const dateFormat = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rol?: string }>
}) {
  const session = await requireAdmin()
  const { q = '', rol } = await searchParams
  const filter = FILTERS.some((f) => f.id === rol) ? rol! : 'all'
  const query = q.trim().slice(0, 80)

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      providerName: providerProfiles.displayName,
      providerSlug: providerProfiles.slug,
      providerStatus: providerProfiles.verificationStatus,
    })
    .from(user)
    .leftJoin(providerProfiles, eq(providerProfiles.userId, user.id))
    .where(query ? or(ilike(user.email, `%${query}%`), ilike(user.name, `%${query}%`)) : undefined)
    .orderBy(desc(user.createdAt))
    .limit(200)

  const users = rows
    .map((r) => {
      const staff = staffRole(r)
      const role: Role = staff ?? (r.providerName ? 'provider' : 'customer')
      return { ...r, staff, role }
    })
    .filter((r) => {
      if (filter === 'staff') return r.staff !== null
      if (filter === 'provider') return r.providerName !== null
      if (filter === 'customer') return r.staff === null && r.providerName === null
      return true
    })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold">Kullanıcılar</h1>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          Süpervizör; talepleri, eşleştirmeyi, hizmet veren onayını ve yorumları yönetir. Bölgelere, kullanıcı
          rollerine ve demo verilerine yalnızca yönetici erişir. Rol değişince kişinin oturumu kapanır.
        </p>
      </div>

      <form role="search" className="flex gap-2" action="/admin/kullanicilar">
        {filter !== 'all' ? <input type="hidden" name="rol" value={filter} /> : null}
        <label htmlFor="user-search" className="sr-only">
          Ad ya da e-posta ile ara
        </label>
        <input
          id="user-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Ad ya da e-posta"
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
        <button
          type="submit"
          className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-card"
          aria-label="Ara"
        >
          <Search aria-hidden="true" className="size-5" />
        </button>
      </form>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Rol filtresi">
        {FILTERS.map((f) => {
          const params = new URLSearchParams()
          if (query) params.set('q', query)
          if (f.id !== 'all') params.set('rol', f.id)
          const qs = params.toString()
          return (
            <Link
              key={f.id}
              href={`/admin/kullanicilar${qs ? `?${qs}` : ''}`}
              aria-current={filter === f.id ? 'true' : undefined}
              className={cn(
                'flex min-h-11 items-center rounded-full border px-4 text-sm font-medium',
                filter === f.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card',
              )}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {users.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Kimse bulunamadı.</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {users.map((u) => {
            const isSelf = u.id === session.user.id
            const lockedAdmin = isAdminEmail(u.email)
            return (
              <li key={u.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-semibold">{u.name}</span>
                    <span className="truncate text-sm text-muted-foreground">{u.email}</span>
                    {u.phone ? (
                      <span className="text-sm text-muted-foreground tabular-nums">{displayPhone(u.phone)}</span>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant={u.staff ? 'default' : 'secondary'}>{ROLE_LABELS[u.role]}</Badge>
                    {isDemoEmail(u.email) ? <Badge variant="outline">Demo</Badge> : null}
                  </div>
                </div>

                {u.providerName ? (
                  <p className="text-sm">
                    Ekip:{' '}
                    <Link href={`/p/${u.providerSlug}`} className="font-medium underline underline-offset-4">
                      {u.providerName}
                    </Link>{' '}
                    <span className="text-muted-foreground">
                      ({u.providerStatus === 'approved' ? 'yayında' : u.providerStatus === 'rejected' ? 'reddedildi' : 'onay bekliyor'})
                    </span>
                  </p>
                ) : null}

                <div className="flex items-end justify-between gap-3">
                  <span className="text-xs text-muted-foreground">Kayıt: {dateFormat.format(u.createdAt)}</span>
                  {isSelf ? (
                    <span className="text-xs text-muted-foreground">Bu sensin</span>
                  ) : lockedAdmin ? (
                    <span className="text-xs text-muted-foreground">ADMIN_EMAILS ile yönetici</span>
                  ) : (
                    <UserRoleSelect userId={u.id} name={u.name} value={u.staff ?? 'none'} />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
