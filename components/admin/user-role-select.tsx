'use client'

import { useRouter } from 'next/navigation'
import { useId, useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { setUserRole } from '@/app/actions/admin'
import { NativeSelect } from '@/components/native-select'

type StaffValue = 'none' | 'supervisor' | 'admin'

export function UserRoleSelect({ userId, name, value }: { userId: string; name: string; value: StaffValue }) {
  const id = useId()
  const router = useRouter()
  const [optimistic, setOptimistic] = useOptimistic(value)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex w-44 flex-col gap-1">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        Yönetim yetkisi
      </label>
      <NativeSelect
        id={id}
        value={optimistic}
        disabled={pending}
        aria-label={`${name} için yönetim yetkisi`}
        onChange={(event) => {
          const next = event.target.value as StaffValue
          startTransition(async () => {
            setOptimistic(next)
            const result = await setUserRole({ userId, staffRole: next })
            if (!result.ok) toast.error(result.error)
            else {
              toast.success('Rol güncellendi.')
              router.refresh()
            }
          })
        }}
      >
        <option value="none">Yok</option>
        <option value="supervisor">Süpervizör</option>
        <option value="admin">Yönetici</option>
      </NativeSelect>
    </div>
  )
}
