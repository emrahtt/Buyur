import { ArrowRight, BadgeCheck, Link2, MapPin, MessageCircle, Wallet } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Plate } from '@/components/brand/plate'
import { Faq } from '@/components/faq'
import { SiteShell } from '@/components/site/site-shell'
import { buttonVariants } from '@/components/ui/button'
import { getProviderForUser, getSession } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Hizmet ver',
  description: 'Bayrampaşa ve Esenler’deki temizlik taleplerini gör, kendi fiyatınla teklif ver. Kayıt ücretsiz.',
}

const BENEFITS = [
  { icon: MapPin, title: 'Sadece senin mahallen', body: 'Seçtiğin mahallelerdeki talepler gelir; yol masrafı yok.' },
  { icon: Wallet, title: 'Fiyatı sen belirlersin', body: 'Buyur Paket bandı yol gösterir, son sözü sen söylersin.' },
  { icon: MessageCircle, title: 'WhatsApp’tan konuş', body: 'Teklifin kabul edilince müşterinin numarası açılır.' },
  { icon: Link2, title: 'Paylaşılabilir profil', body: 'Yorumların ve rozetlerinle tek link; müşterine at, güven kazan.' },
]

const FAQ = [
  {
    q: 'Kayıt ücretli mi, komisyon var mı?',
    a: 'Şu an kayıt da teklif vermek de ücretsiz. Ücretlendirmeye geçersek önceden haber verir, mevcut işlerine dokunmayız.',
  },
  {
    q: 'Buyur Onaylı rozeti için ne gerekiyor?',
    a: 'Kimlik ve adres teyidi, en az bir referans görüşmesi ve ekibimizin gözetiminde bir deneme işi. Hepsi tamamlanınca rozet profiline eklenir.',
  },
  {
    q: 'Onay ne kadar sürer?',
    a: 'Profilini oluşturduktan sonra ekibimiz seni arar. Kontroller tamamlanınca profilin yayına çıkar ve talepleri görmeye başlarsın.',
  },
]

export default async function BecomeProviderPage() {
  const session = await getSession()
  const provider = session ? await getProviderForUser(session.user.id) : null
  const cta = provider
    ? { href: '/veren', label: 'Paneline git' }
    : session
      ? { href: '/veren/kayit', label: 'Profilini oluştur' }
      : { href: '/kayit?rol=veren', label: 'Ücretsiz kaydol' }

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 pb-12 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-5">
          <Plate as="h1" size="lg" overline="Hizmet verenler için" className="text-4xl sm:text-5xl">
            Mahallenden iş gelsin.
          </Plate>
          <p className="max-w-md text-lg leading-relaxed text-pretty text-muted-foreground">
            Bayrampaşa ve Esenler’de temizlik yapan ekipler için: bölgendeki talepleri gör, kendi fiyatını ver,
            müşterinle doğrudan konuş.
          </p>
          <Link href={cta.href} className={buttonVariants({ size: 'lg', className: 'self-start' })}>
            {cta.label}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>
        <Image
          src="/images/ekip.png"
          alt="Elinde temizlik malzemeleriyle gülümseyen bir temizlik profesyoneli"
          width={1376}
          height={768}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          className="aspect-[4/3] w-full rounded-2xl object-cover"
        />
      </section>

      <section aria-labelledby="neden" className="border-y bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 id="neden" className="mb-8 text-3xl font-bold text-balance">
            Neden Buyur?
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-plate text-plate-foreground">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-heading text-lg font-semibold">{title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="rozet" className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-12">
        <BadgeCheck aria-hidden="true" className="size-8 text-primary" />
        <h2 id="rozet" className="text-3xl font-bold text-balance">
          Rozetin, en iyi reklamın.
        </h2>
        <p className="leading-relaxed text-pretty text-muted-foreground">
          Müşteriler kapılarını tanımadıkları birine açmak istemez. Buyur Onaylı rozeti, kontrolden geçtiğini
          gösterir ve tekliflerinde en üstte görünmeni sağlar.
        </p>
      </section>

      <Faq items={FAQ} />
    </SiteShell>
  )
}
