'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth-client'
import { tr } from '@/lib/i18n/tr'

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      className={className}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut()
          router.push('/')
          router.refresh()
        })
      }
    >
      <LogOut data-icon="inline-start" />
      {tr.nav.signOut}
    </Button>
  )
}
