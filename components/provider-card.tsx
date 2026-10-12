import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatTLRange } from '@/lib/format'
import type { ProviderCard as ProviderCardData } from '@/lib/queries'
import { ProviderAvatar } from './provider-avatar'
import { Rating, VerifiedBadge } from './trust'

export function ProviderCard({ provider }: { provider: ProviderCardData }) {
  return (
    <Link
      href={`/p/${provider.slug}`}
      className="group flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:border-primary/40"
    >
      <ProviderAvatar slug={provider.slug} name={provider.displayName} hasAvatar={provider.hasAvatar} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate font-heading font-semibold">{provider.displayName}</span>
          {provider.isVerified ? <VerifiedBadge /> : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {provider.ratingCount > 0 ? (
            <Rating value={provider.ratingAvg} count={provider.ratingCount} />
          ) : (
            <span>Yeni ekip</span>
          )}
          {provider.priceMin && provider.priceMax ? (
            <span className="tabular-nums">{formatTLRange(provider.priceMin, provider.priceMax)}</span>
          ) : null}
        </div>
      </div>
      <ChevronRight
        aria-hidden="true"
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  )
}
