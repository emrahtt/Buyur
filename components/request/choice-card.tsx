import { cn } from '@/lib/utils'

/** A native radio rendered as a large tappable card; keeps arrow-key and screen-reader behaviour for free. */
export function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  children,
  className,
}: {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <label
      className={cn(
        'relative flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
        checked ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/40',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2',
          checked ? 'border-primary' : 'border-input',
        )}
      >
        {checked ? <span className="size-2.5 rounded-full bg-primary" /> : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">{children}</span>
    </label>
  )
}

export function ChoiceChip({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <label
      className={cn(
        'flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50',
        checked
          ? 'border-primary bg-primary text-primary-foreground'
          : 'bg-card hover:border-primary/40',
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {children}
    </label>
  )
}
