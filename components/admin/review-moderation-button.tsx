'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { setReviewStatus } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'

export function ReviewModerationButton({ reviewId, hidden }: { reviewId: string; hidden: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="outline"
      size="sm"
      className="self-start"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setReviewStatus(reviewId, hidden ? 'published' : 'hidden')
          if (!result.ok) toast.error(result.error)
          else router.refresh()
        })
      }
    >
      {hidden ? <Eye data-icon="inline-start" /> : <EyeOff data-icon="inline-start" />}
      {hidden ? 'Yayına al' : 'Gizle'}
    </Button>
  )
}
