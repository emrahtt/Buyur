import { cn } from '@/lib/utils'

type PlateProps = {
  /** Small upper line, like the district on an Istanbul street plate. */
  overline?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  as?: 'div' | 'span' | 'h1' | 'h2'
}

/**
 * Istanbul enamel street plate: cobalt field, thin white inset frame, white lettering.
 * The single signature element of the Buyur identity.
 */
export function Plate({ overline, children, className, size = 'md', as: Tag = 'div' }: PlateProps) {
  return (
    <Tag
      className={cn(
        'inline-flex w-fit rounded-xl bg-plate text-plate-foreground shadow-[0_1px_0_0_oklch(1_0_0/0.25)_inset,0_8px_24px_-12px_oklch(0.3_0.15_261/0.6)]',
        size === 'sm' && 'rounded-md p-0.5',
        size === 'md' && 'p-1',
        size === 'lg' && 'rounded-2xl p-1.5',
      )}
    >
      <span
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-plate-foreground/90 text-center',
          size === 'sm' && 'rounded-sm border px-2 py-0.5',
          size === 'md' && 'border-2 px-4 py-2',
          size === 'lg' && 'rounded-xl border-[3px] px-6 py-4',
          className,
        )}
      >
        {overline ? (
          <span
            className={cn(
              'font-sans font-semibold uppercase tracking-[0.18em] text-plate-foreground/80',
              size === 'lg' ? 'text-xs' : 'text-[0.65rem]',
            )}
          >
            {overline}
          </span>
        ) : null}
        <span className="font-heading font-extrabold leading-none tracking-tight">{children}</span>
      </span>
    </Tag>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <Plate size="sm" as="span" className={cn('text-lg', className)}>
      Buyur
    </Plate>
  )
}
