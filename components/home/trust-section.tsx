import { Check } from 'lucide-react'
import Link from 'next/link'
import { Stars, VerifiedBadge } from '@/components/trust'
import { tr } from '@/lib/i18n/tr'
import { getRecentReviews, shortName } from '@/lib/queries'

export async function TrustSection() {
  const reviews = await getRecentReviews(3)
  return (
    <section aria-labelledby="guven" className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <VerifiedBadge className="self-start" />
        <h2 id="guven" className="text-3xl font-bold text-balance">
          Kapını açacağın ekibi biz önceden tanıyoruz.
        </h2>
        <p className="leading-relaxed text-pretty text-muted-foreground">
          Buyur Onaylı rozeti dört kontrolden geçen ekiplere verilir. Rozet olmayan ekipler de yayında
          olabilir, ama kimin hangi kontrolden geçtiğini profilinde açıkça görürsün.
        </p>
        <ul className="flex flex-col gap-2">
          {Object.values(tr.checklist).map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="flex size-6 items-center justify-center rounded-full bg-success/15 text-success">
                <Check aria-hidden="true" className="size-4" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-heading text-lg font-semibold">Komşular ne diyor?</h3>
        {reviews.map((review) => (
          <figure key={review.id} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <Stars value={review.rating} />
            <blockquote className="leading-relaxed text-pretty">“{review.comment}”</blockquote>
            <figcaption className="text-sm text-muted-foreground">
              {shortName(review.contactName)} ·{' '}
              <Link href={`/p/${review.providerSlug}`} className="font-medium text-primary hover:underline">
                {review.providerName}
              </Link>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
