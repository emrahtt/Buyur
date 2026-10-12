import Image from 'next/image'
import { Plate } from '@/components/brand/plate'
import { SmartRequestBox } from './smart-request-box'

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pt-6 pb-12 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-12 md:pt-14 md:pb-20">
      <div className="flex flex-col gap-6">
        <div className="animate-rise">
          <Plate as="h1" size="lg" overline="Bayrampaşa · Esenler" className="text-5xl sm:text-6xl">
            Ne lazım?
            <br />
            Buyur.
          </Plate>
        </div>
        <p className="max-w-md animate-rise text-lg leading-relaxed text-pretty text-muted-foreground [animation-delay:80ms]">
          Mahallendeki onaylı temizlik ekiplerinden dakikalar içinde fiyat teklifi al.{' '}
          <span className="text-foreground">Üyelik yok, uygulama indirme yok.</span>
        </p>
        <div className="animate-rise [animation-delay:160ms]">
          <SmartRequestBox />
        </div>
      </div>

      <figure className="relative animate-rise [animation-delay:200ms]">
        <Image
          src="/images/mahalle.png"
          alt="Bayrampaşa’da tertemiz bir apartman girişi, pencere önünde bir bardak çay"
          width={768}
          height={1376}
          priority
          sizes="(min-width: 768px) 40vw, 100vw"
          className="aspect-[5/4] w-full rounded-2xl object-cover object-[50%_65%] md:aspect-[4/5] md:object-center"
        />
        <div className="absolute top-4 left-4 rotate-[-2deg] md:top-6 md:left-6">
          <Plate size="md" overline="Bayrampaşa" className="text-xl">
            Kartaltepe Mah.
          </Plate>
        </div>
      </figure>
    </section>
  )
}
