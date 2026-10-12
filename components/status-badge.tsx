import type { RequestStatus } from '@/lib/db/schema'
import { tr } from '@/lib/i18n/tr'
import { cn } from '@/lib/utils'

const STYLES: Record<RequestStatus, string> = {
  open: 'bg-tea/20 text-tea-foreground dark:text-tea',
  matched: 'bg-primary/12 text-primary',
  completed: 'bg-success/15 text-success',
  cancelled: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        STYLES[status],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {tr.requestStatus[status]}
    </span>
  )
}
