'use client'

import { Check, Copy, Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cancelRequest, claimRequest, completeRequest } from '@/app/actions/requests'
import { Button, buttonVariants } from '@/components/ui/button'

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="outline"
      onClick={async () => {
        const url = window.location.href.split('?')[0]
        try {
          if (navigator.share) await navigator.share({ title: 'Buyur talebim', url })
          else {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }
        } catch {
          // User dismissed the share sheet.
        }
      }}
    >
      {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
      {copied ? 'Kopyalandı' : 'Linki kaydet'}
    </Button>
  )
}

export function CompleteButton({ token }: { token: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      size="lg"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await completeRequest(token)
          if (!result.ok) toast.error(result.error)
          else router.refresh()
        })
      }
    >
      {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Check data-icon="inline-start" />}
      İş tamamlandı
    </Button>
  )
}

export function CancelButton({ token }: { token: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!confirming) {
    return (
      <Button variant="ghost" className="text-muted-foreground" onClick={() => setConfirming(true)}>
        Talebi iptal et
      </Button>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="İptal onayı">
      <span className="text-sm">Emin misin?</span>
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await cancelRequest(token)
            if (!result.ok) toast.error(result.error)
            else router.refresh()
          })
        }
      >
        Evet, iptal et
      </Button>
      <Button variant="ghost" onClick={() => setConfirming(false)}>
        Vazgeç
      </Button>
    </div>
  )
}

export function ClaimButton({ token, signedIn }: { token: string; signedIn: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  if (!signedIn) {
    return (
      <Link href={`/kayit?next=/talep/${token}`} className={buttonVariants({ variant: 'outline' })}>
        <UserPlus data-icon="inline-start" />
        Hesap aç, talebini sakla
      </Link>
    )
  }
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await claimRequest(token)
          if (!result.ok) toast.error(result.error)
          else {
            toast.success('Talep hesabına eklendi.')
            router.refresh()
          }
        })
      }
    >
      <UserPlus data-icon="inline-start" />
      Hesabıma ekle
    </Button>
  )
}

/** While waiting for offers, quietly re-render the server page so new offers appear. */
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh()
    }, seconds * 1000)
    return () => clearInterval(id)
  }, [router, seconds])
  return null
}
