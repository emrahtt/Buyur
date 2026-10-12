import { desc, eq } from 'drizzle-orm'
import { ReviewModerationButton } from '@/components/admin/review-moderation-button'
import { Stars } from '@/components/trust'
import { db } from '@/lib/db'
import { providerProfiles, requests, reviews } from '@/lib/db/schema'
import { formatShortDate } from '@/lib/format'
import { requireAdmin } from '@/lib/session'
import { cn } from '@/lib/utils'

export default async function AdminReviewsPage() {
  await requireAdmin()
  const rows = await db
    .select({ review: reviews, providerName: providerProfiles.displayName, contactName: requests.contactName })
    .from(reviews)
    .innerJoin(providerProfiles, eq(providerProfiles.id, reviews.providerId))
    .leftJoin(requests, eq(requests.id, reviews.requestId))
    .orderBy(desc(reviews.createdAt))
    .limit(100)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold">Yorumlar</h1>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Henüz yorum yok.</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {rows.map(({ review, providerName, contactName }) => (
            <li
              key={review.id}
              className={cn('flex flex-col gap-2 rounded-xl border bg-card p-4', review.status === 'hidden' && 'opacity-60')}
            >
              <div className="flex items-center justify-between gap-2">
                <Stars value={review.rating} />
                <span className="text-xs text-muted-foreground">{formatShortDate(review.createdAt)}</span>
              </div>
              {review.comment ? <p className="leading-relaxed">{review.comment}</p> : null}
              <p className="text-sm text-muted-foreground">
                {contactName ?? 'Misafir'} → {providerName}
              </p>
              <ReviewModerationButton reviewId={review.id} hidden={review.status === 'hidden'} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
