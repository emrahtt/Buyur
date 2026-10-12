import Link from 'next/link'
import { Wordmark } from '@/components/brand/plate'
import { buttonVariants } from '@/components/ui/button'
import { tr } from '@/lib/i18n/tr'
import { isStaff } from '@/lib/roles'
import { getProviderForUser, getSession } from '@/lib/session'
import { cn } from '@/lib/utils'
import { MobileMenu, type MenuLink } from './mobile-menu'

export async function SiteHeader() {
  const session = await getSession()
  const user = session?.user
  const provider = user ? await getProviderForUser(user.id) : null

  const links: MenuLink[] = [
    { href: '/hizmet/temizlik', label: 'Temizlik' },
    { href: '/#yakinda', label: 'Yakında gelecekler' },
    { href: '/hizmet-ver', label: tr.nav.becomeProvider },
  ]
  if (user) {
    links.push({ href: '/panel', label: tr.nav.panel })
    if (provider) links.push({ href: '/veren', label: tr.nav.providerPanel })
    if (isStaff(user)) links.push({ href: '/admin', label: tr.nav.admin })
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" aria-label="Buyur ana sayfa" className="flex min-h-11 items-center">
          <Wordmark />
        </Link>

        <nav aria-label="Ana menü" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {!user ? (
            <Link
              href="/giris"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'hidden md:inline-flex')}
            >
              {tr.nav.signIn}
            </Link>
          ) : null}
          <Link href="/talep/yeni?modul=temizlik" className={buttonVariants({ size: 'sm' })}>
            {tr.nav.newRequest}
          </Link>
          <MobileMenu links={links} signedInAs={user?.email ?? null} />
        </div>
      </div>
    </header>
  )
}
