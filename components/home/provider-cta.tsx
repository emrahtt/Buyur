import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export function ProviderCta() {
  return (
    <section aria-labelledby="veren" className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid overflow-hidden rounded-2xl bg-plate text-plate-foreground md:grid-cols-2">
        <Image
          src="/images/ekip.png"
          alt="Elinde temizlik malzemeleriyle gülümseyen bir temizlik profesyoneli"
          width={1376}
          height={768}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="aspect-[4/3] h-full w-full object-cover md:aspect-auto"
        />
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <h2 id="veren" className="text-3xl font-bold text-balance">
            Temizlik ekibin mi var? Mahallenden iş gelsin.
          </h2>
          <p className="leading-relaxed text-pretty text-plate-foreground/85">
            Kayıt ücretsiz. Bölgendeki talepleri gör, kendi fiyatını ver, WhatsApp’tan konuş. Profil
            linkini müşterilerinle paylaş, yorumların seninle büyüsün.
          </p>
          <Link
            href="/hizmet-ver"
            className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-xl bg-plate-foreground px-5 font-medium text-plate transition-opacity hover:opacity-90"
          >
            Nasıl çalışıyor?
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
