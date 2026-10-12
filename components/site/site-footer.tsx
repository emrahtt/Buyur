import Link from 'next/link'
import { Wordmark } from '@/components/brand/plate'
import { tr } from '@/lib/i18n/tr'
import { activeCategoryPairs } from '@/lib/modules'

const LEGAL = [
  { href: '/kvkk', label: 'KVKK aydınlatma metni' },
  { href: '/gizlilik', label: 'Gizlilik' },
  { href: '/kosullar', label: 'Kullanım koşulları' },
  { href: '/cerez', label: 'Çerez politikası' },
]

export function SiteFooter() {
  const categories = activeCategoryPairs()
  return (
    <footer className="mt-16 border-t bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:flex-row md:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <Wordmark />
          <p className="text-sm leading-relaxed text-muted-foreground">{tr.site.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <h2 className="mb-1 font-heading text-sm font-semibold">Hizmetler</h2>
            {categories.map(({ category }) => (
              <Link
                key={category.slug}
                href={`/bayrampasa/${category.slug}`}
                className="py-1.5 text-muted-foreground hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="mb-1 font-heading text-sm font-semibold">Buyur</h2>
            <Link href="/hizmet-ver" className="py-1.5 text-muted-foreground hover:text-foreground">
              Hizmet ver
            </Link>
            <Link href="/tanitim" className="py-1.5 text-muted-foreground hover:text-foreground">
              Tanıtım ve QR
            </Link>
            <Link href="/giris" className="py-1.5 text-muted-foreground hover:text-foreground">
              Giriş yap
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="mb-1 font-heading text-sm font-semibold">Yasal</h2>
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="py-1.5 text-muted-foreground hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Buyur · {tr.site.region}
        </p>
      </div>
    </footer>
  )
}
