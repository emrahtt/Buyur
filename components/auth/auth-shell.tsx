import Link from 'next/link'
import { Plate, Wordmark } from '@/components/brand/plate'

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <main className="flex flex-1 flex-col">
      <header className="mx-auto flex h-16 w-full max-w-md items-center px-4">
        <Link href="/" aria-label="Buyur ana sayfa" className="flex min-h-11 items-center">
          <Wordmark />
        </Link>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 pt-4 pb-12">
        <div className="flex flex-col gap-4">
          <Plate size="md" as="h1" className="text-3xl">
            {title}
          </Plate>
          <p className="leading-relaxed text-pretty text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
    </main>
  )
}
