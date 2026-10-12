'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { deleteDemoData } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'

export function DemoDataCard({ count }: { count: number }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-dashed p-4">
      <h2 className="font-heading text-lg font-semibold">Demo verileri</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Sitede {count} örnek hizmet veren ve yorumları yayında. Gerçek ekipler katılınca tek tıkla kaldır.
      </p>
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Geri alınamaz. Emin misin?</span>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteDemoData()
                if (!result.ok) toast.error(result.error)
                else {
                  toast.success('Demo verileri silindi.')
                  router.refresh()
                }
              })
            }
          >
            Evet, sil
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Vazgeç
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="self-start" onClick={() => setConfirming(true)}>
          <Trash2 data-icon="inline-start" />
          Demo verilerini sil
        </Button>
      )}
    </section>
  )
}
