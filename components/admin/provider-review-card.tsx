'use client'

import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { setChecklistItem, setProviderStatus } from '@/app/actions/admin'
import { Button, buttonVariants } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { VerificationChecklist } from '@/lib/db/schema'
import { displayPhone, whatsappLink } from '@/lib/format'
import { tr } from '@/lib/i18n/tr'
import { cn } from '@/lib/utils'

type Row = {
  id: string
  slug: string
  displayName: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  status: string
  isVerified: boolean
  isDemo: boolean
  checklist: VerificationChecklist
  services: string[]
  regionCount: number
}

export function ProviderReviewCard({ row }: { row: Row }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action()
      if (!result.ok) toast.error(result.error ?? tr.errors.generic)
      else router.refresh()
    })
  }

  const contact = row.whatsapp ?? row.phone

  return (
    <article className={cn('flex flex-col gap-4 rounded-xl border bg-card p-4', pending && 'opacity-70')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/p/${row.slug}`} className="font-heading text-lg font-semibold hover:underline">
              {row.displayName}
            </Link>
            {row.isDemo ? (
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">Demo</span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {row.email ?? 'Hesapsız'}
            {row.phone ? ` · ${displayPhone(row.phone)}` : ''}
          </p>
          <p className="text-sm text-muted-foreground">
            {row.services.join(', ')} · {row.regionCount} mahalle
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold',
            row.status === 'approved' && 'bg-success/15 text-success',
            row.status === 'pending' && 'bg-tea/20 text-tea-foreground dark:text-tea',
            row.status === 'rejected' && 'bg-destructive/10 text-destructive',
          )}
        >
          {tr.verification[row.status] ?? row.status}
        </span>
      </div>

      <fieldset className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-medium">
          Buyur Onaylı kontrolleri {row.isVerified ? '· rozet verildi' : ''}
        </legend>
        {(Object.keys(tr.checklist) as (keyof typeof tr.checklist)[]).map((key) => (
          <label key={key} className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm">
            {tr.checklist[key]}
            <Switch
              checked={Boolean(row.checklist[key])}
              disabled={pending}
              onCheckedChange={(checked) => run(() => setChecklistItem(row.id, key, checked))}
            />
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap gap-2">
        {row.status !== 'approved' ? (
          <Button disabled={pending} onClick={() => run(() => setProviderStatus(row.id, 'approved'))}>
            Yayına al
          </Button>
        ) : (
          <Button variant="outline" disabled={pending} onClick={() => run(() => setProviderStatus(row.id, 'pending'))}>
            Yayından çek
          </Button>
        )}
        {row.status !== 'rejected' ? (
          <Button variant="ghost" disabled={pending} onClick={() => run(() => setProviderStatus(row.id, 'rejected'))}>
            Reddet
          </Button>
        ) : null}
        {contact ? (
          <a
            href={whatsappLink(contact, `Merhaba ${row.displayName}, Buyur'dan yazıyorum. Profil onayınız için kısa bir görüşme yapabilir miyiz?`)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'outline' })}
          >
            <MessageCircle data-icon="inline-start" />
            WhatsApp
          </a>
        ) : null}
      </div>
    </article>
  )
}
