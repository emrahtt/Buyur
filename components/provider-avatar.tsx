import { cn } from '@/lib/utils'

export function ProviderAvatar({
  slug,
  name,
  hasAvatar,
  className,
}: {
  slug: string
  name: string
  hasAvatar: boolean
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR'))
    .join('')

  if (hasAvatar) {
    return (
      // Private blob served through an app route, so next/image optimisation is not applicable.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/avatar/${slug}`}
        alt=""
        className={cn('size-12 shrink-0 rounded-xl object-cover', className)}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-xl bg-plate font-heading text-base font-bold text-plate-foreground',
        className,
      )}
    >
      {initials}
    </span>
  )
}
