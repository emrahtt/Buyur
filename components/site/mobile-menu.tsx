'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Wordmark } from '@/components/brand/plate'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { tr } from '@/lib/i18n/tr'
import { cn } from '@/lib/utils'
import { SignOutButton } from './sign-out-button'

export type MenuLink = { href: string; label: string }

export function MobileMenu({ links, signedInAs }: { links: MenuLink[]; signedInAs: string | null }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Menüyü aç" />}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] gap-0 p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle>
            <Wordmark />
            <span className="sr-only">Menü</span>
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobil menü" className="flex flex-col p-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t p-4 pb-safe">
          {signedInAs ? (
            <>
              <p className="truncate text-sm text-muted-foreground">{signedInAs}</p>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/giris"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                {tr.nav.signIn}
              </Link>
              <Link
                href="/kayit"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: 'ghost' }))}
              >
                {tr.nav.signUp}
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
