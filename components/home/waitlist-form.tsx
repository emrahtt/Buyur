'use client'

import { Bell, Check } from 'lucide-react'
import { useActionState, useState } from 'react'
import { joinWaitlist, type WaitlistState } from '@/app/actions/waitlist'
import { NativeSelect } from '@/components/native-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function WaitlistForm({
  moduleSlug,
  moduleName,
  regions,
}: {
  moduleSlug: string
  moduleName: string
  regions: { id: number; label: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, null)

  if (state?.ok) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-success" role="status">
        <Check aria-hidden="true" className="size-4" />
        {state.message}
      </p>
    )
  }

  if (!open) {
    return (
      <Button variant="outline" className="self-start" onClick={() => setOpen(true)}>
        <Bell data-icon="inline-start" />
        Açılınca haber ver
      </Button>
    )
  }

  const contactId = `wl-contact-${moduleSlug}`
  const regionId = `wl-region-${moduleSlug}`

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="moduleSlug" value={moduleSlug} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <label htmlFor={contactId} className="text-sm font-medium">
        Cep telefonu ya da e-posta
      </label>
      <Input
        id={contactId}
        name="contact"
        required
        autoComplete="on"
        placeholder="05xx xxx xx xx ya da e-posta"
        className="h-12 text-base"
      />
      <label htmlFor={regionId} className="text-sm font-medium">
        Mahallen <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
      </label>
      <NativeSelect id={regionId} name="regionId" defaultValue="">
        <option value="">Seçmek istemiyorum</option>
        {regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </NativeSelect>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Bu bilgiyi yalnızca {moduleName} açıldığında sana haber vermek için kullanırız.
      </p>
      {state && !state.ok ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="self-start">
        Kaydet
      </Button>
    </form>
  )
}
