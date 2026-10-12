'use client'

import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { setRegionActive } from '@/app/actions/admin'
import { Switch } from '@/components/ui/switch'

export function RegionToggle({ id, name, active }: { id: number; name: string; active: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(active)
  const [, startTransition] = useTransition()
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 text-sm">
      {name}
      <Switch
        checked={optimistic}
        onCheckedChange={(checked) =>
          startTransition(async () => {
            setOptimistic(checked)
            const result = await setRegionActive(id, checked)
            if (!result.ok) toast.error(result.error)
          })
        }
      />
    </label>
  )
}
