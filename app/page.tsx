import { Faq } from '@/components/faq'
import { Hero } from '@/components/home/hero'
import { HowItWorks } from '@/components/home/how-it-works'
import { ProviderCta } from '@/components/home/provider-cta'
import { ServicePackages } from '@/components/home/service-packages'
import { TrustSection } from '@/components/home/trust-section'
import { UpcomingModules } from '@/components/home/upcoming-modules'
import { SiteShell } from '@/components/site/site-shell'
import { getModule } from '@/lib/modules'

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <ServicePackages />
      <HowItWorks />
      <TrustSection />
      <UpcomingModules />
      <ProviderCta />
      <Faq items={getModule('temizlik')!.faq} />
    </SiteShell>
  )
}
