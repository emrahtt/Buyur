import { MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import QRCode from 'qrcode'
import { Plate } from '@/components/brand/plate'
import { PrintButton } from '@/components/print-button'
import { SiteShell } from '@/components/site/site-shell'
import { buttonVariants } from '@/components/ui/button'
import { siteUrl } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Tanıtım ve QR',
  description: 'Buyur’u apartman panosuna as, WhatsApp gruplarında paylaş.',
}

export default async function PromoPage() {
  const url = siteUrl()
  const qr = await QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#1b2236', light: '#ffffff' } })
  const shareText = `Mahallede temizlikçi arayan var mı? Buyur'dan dakikalar içinde fiyat teklifi alınıyor, üyelik yok: ${url}`

  return (
    <SiteShell>
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2 print:hidden">
          <h1 className="text-3xl font-bold">Tanıtım kartı</h1>
          <p className="leading-relaxed text-muted-foreground">
            Yazdır, apartman panosuna as ya da WhatsApp gruplarında paylaş.
          </p>
        </div>

        <section
          aria-label="Yazdırılabilir tanıtım kartı"
          className="flex flex-col items-center gap-6 rounded-3xl border-2 bg-card p-6 text-center text-card-foreground print:border-0"
        >
          <Plate size="lg" overline="Bayrampaşa · Esenler" className="text-4xl">
            Ne lazım?
            <br />
            Buyur.
          </Plate>
          <p className="max-w-sm text-lg leading-relaxed text-pretty">
            Mahallendeki onaylı temizlik ekiplerinden dakikalar içinde fiyat teklifi al.
          </p>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            <li>Üyelik yok, uygulama indirme yok</li>
            <li>Fiyat bandı baştan belli</li>
            <li>Kimliği ve referansı kontrol edilmiş ekipler</li>
          </ul>
          <div
            role="img"
            aria-label={`Buyur adresine giden QR kod: ${url}`}
            className="size-48 rounded-xl bg-white p-3 [&_svg]:size-full"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG generated server-side by the qrcode library from our own URL
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <p className="font-heading text-lg font-semibold break-all">{url.replace(/^https?:\/\//, '')}</p>
        </section>

        <div className="flex flex-wrap gap-2 print:hidden">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: 'lg' })}
          >
            <MessageCircle data-icon="inline-start" />
            WhatsApp’ta paylaş
          </a>
          <PrintButton />
        </div>
      </div>
    </SiteShell>
  )
}
