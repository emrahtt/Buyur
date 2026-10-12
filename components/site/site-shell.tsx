import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
