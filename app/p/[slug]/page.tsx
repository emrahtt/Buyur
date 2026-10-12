import { Check, Circle, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProviderAvatar } from '@/components/provider-avatar'
import { SiteShell } from '@/components/site/site-shell'
import { Rating, Stars, VerifiedBadge } from '@/components/trust'
import { buttonVariants } from '@/components/ui/button'
import { formatShortDate, formatTLRange, whatsappLink } from '@/lib/format'
import { tr } from '@/lib/i18n/tr'
import { getCategory, getPackage } from '@/lib/modules'
import { getProviderBySlug, shortName } from '@/lib/queries'
import { buildRequestUrl } from '@/lib/request-url'
import { currentStaff, getSession } from '@/lib/session'
import { cn } from '@/lib/utils'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await getProviderBySlug((await params).slug)
  if (!data || data.profile.verificationStatus !== 'approved') return { robots: { index: false } }
  const { profile } = data
  const rating = profile.ratingCount > 0 ? ` · ${Number(profile.ratingAvg).toFixed(1)} puan` : ''
  return {
    title: profile.displayName,
    description: `${profile.displayName}: Bayrampaşa ve Esenler’de temizlik${rating}. Buyur üzerinden teklif al.`,
    alternates: { canonical: `/p/${profile.slug}` },
  }
}

export default async function ProviderProfilePage({ params }: { params: Params }) {
  const data = await getProviderBySlug((await params).slug)
  if (!data) notFound()
  const { profile, services, regions, reviews } = data

  if (profile.verificationStatus !== 'approved') {
    const session = await getSession()
    const isOwner = session?.user.id === profile.userId
    if (!isOwner && !(await currentStaff())) notFound()
  }

  const checklist = profile.verificationChecklist ?? {}
  const firstService = services[0]
  const whatsapp = profile.whatsapp ?? profile.phone
  const districts = [...new Set(regions.map((r) => r.district))]

  return (
    <SiteShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
        {profile.verificationStatus !== 'approved' ? (
          <p className="rounded-lg bg-tea/15 px-3 py-2 text-sm text-tea-foreground dark:text-tea">
            Önizleme: bu profil henüz yayında değil.
          </p>
        ) : null}

        <header className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <ProviderAvatar slug={profile.slug} name={profile.displayName} hasAvatar={Boolean(profile.avatarPathname)} className="size-20 rounded-2xl text-2xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <h1 className="text-3xl font-bold text-balance">{profile.displayName}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {profile.isVerified ? <VerifiedBadge /> : null}
                {profile.ratingCount > 0 ? (
                  <Rating value={Number(profile.ratingAvg)} count={profile.ratingCount} />
                ) : (
                  <span className="text-sm text-muted-foreground">Yeni ekip</span>
                )}
                <span className="text-sm text-muted-foreground">{profile.jobsCompleted} tamamlanan iş</span>
              </div>
            </div>
          </div>
          {profile.bio ? <p className="leading-relaxed text-pretty">{profile.bio}</p> : null}
          <div className="flex flex-wrap gap-2">
            {firstService ? (
              <Link
                href={buildRequestUrl({ moduleSlug: firstService.moduleSlug, categorySlug: firstService.categorySlug })}
                className={buttonVariants({ size: 'lg' })}
              >
                Teklif iste
              </Link>
            ) : null}
            {whatsapp ? (
              <a
                href={whatsappLink(whatsapp, `Merhaba ${profile.displayName}, Buyur'daki profilinizi gördüm.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: 'lg', variant: 'outline' })}
              >
                <MessageCircle data-icon="inline-start" />
                WhatsApp
              </a>
            ) : null}
          </div>
        </header>

        <section aria-labelledby="kontroller" className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <h2 id="kontroller" className="font-heading text-lg font-semibold">
            Buyur kontrolleri
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {Object.entries(tr.checklist).map(([key, label]) => {
              const done = Boolean(checklist[key as keyof typeof checklist])
              return (
                <li key={key} className={cn('flex items-center gap-2 text-sm', !done && 'text-muted-foreground')}>
                  {done ? (
                    <Check aria-hidden="true" className="size-4 text-success" />
                  ) : (
                    <Circle aria-hidden="true" className="size-4" />
                  )}
                  {label}
                  <span className="sr-only">{done ? ': yapıldı' : ': henüz yapılmadı'}</span>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="hizmetler" className="flex flex-col gap-3">
          <h2 id="hizmetler" className="font-heading text-xl font-bold">
            Hizmetler
          </h2>
          <ul className="flex flex-col divide-y rounded-xl border bg-card">
            {services.map((s) => {
              const category = getCategory(s.moduleSlug, s.categorySlug)
              if (!category) return null
              const pkg = category.packages[0] ? getPackage(s.moduleSlug, s.categorySlug, category.packages[0].slug) : undefined
              const min = s.priceMin ?? pkg?.priceMin
              const max = s.priceMax ?? pkg?.priceMax
              return (
                <li key={s.categorySlug} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="font-medium">{category.name}</span>
                  {min && max ? (
                    <span className="text-sm text-muted-foreground tabular-nums">{formatTLRange(min, max)}</span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="bolgeler" className="flex flex-col gap-2">
          <h2 id="bolgeler" className="font-heading text-xl font-bold">
            Gittiği mahalleler
          </h2>
          {districts.map((d) => (
            <p key={d} className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">{d}:</span>{' '}
              {regions
                .filter((r) => r.district === d)
                .map((r) => r.name)
                .join(', ')}
            </p>
          ))}
        </section>

        <section aria-labelledby="yorumlar" className="flex flex-col gap-3">
          <h2 id="yorumlar" className="font-heading text-xl font-bold">
            Yorumlar
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz yorum yok.</p>
          ) : (
            reviews.map((review) => {
              const category = review.categorySlug ? getCategory('temizlik', review.categorySlug) : undefined
              return (
                <figure key={review.id} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Stars value={review.rating} />
                    <span className="text-xs text-muted-foreground">{formatShortDate(review.createdAt)}</span>
                  </div>
                  {review.comment ? <blockquote className="leading-relaxed">{review.comment}</blockquote> : null}
                  <figcaption className="text-sm text-muted-foreground">
                    {shortName(review.contactName)}
                    {category ? ` · ${category.name}` : ''}
                  </figcaption>
                </figure>
              )
            })
          )}
        </section>
      </div>
      {profile.verificationStatus === 'approved' ? (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD from validated DB fields
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: profile.displayName,
              description: profile.bio ?? undefined,
              areaServed: districts.map((d) => ({ '@type': 'AdministrativeArea', name: `${d}, İstanbul` })),
              ...(profile.ratingCount > 0
                ? {
                    aggregateRating: {
                      '@type': 'AggregateRating',
                      ratingValue: Number(profile.ratingAvg),
                      reviewCount: profile.ratingCount,
                    },
                  }
                : {}),
            }).replace(/</g, '\\u003c'),
          }}
        />
      ) : null}
    </SiteShell>
  )
}
