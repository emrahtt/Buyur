import { BadgeCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary',
        className,
      )}
    >
      <BadgeCheck aria-hidden="true" className="size-3.5" />
      Buyur Onaylı
    </span>
  )
}

export function Rating({
  value,
  count,
  className,
}: {
  value: number
  count?: number
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-sm', className)}>
      <Star aria-hidden="true" className="size-4 fill-tea text-tea" />
      <span className="font-semibold tabular-nums">{value.toFixed(1).replace('.', ',')}</span>
      {count !== undefined ? (
        <span className="text-muted-foreground">({count} yorum)</span>
      ) : null}
      <span className="sr-only">5 üzerinden</span>
    </span>
  )
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} aria-label={`5 üzerinden ${value} yıldız`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn('size-4', i <= value ? 'fill-tea text-tea' : 'text-border')}
        />
      ))}
    </span>
  )
}
