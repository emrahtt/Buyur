import { SiteShell } from '@/components/site/site-shell'
import { CONSENT_VERSION } from '@/lib/i18n/tr'

export type LegalSection = { title: string; body: (string | string[])[] }

export function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <SiteShell>
      <article className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-balance">{title}</h1>
          <p className="text-sm text-muted-foreground">Sürüm {CONSENT_VERSION}</p>
          <p className="leading-relaxed text-pretty">{intro}</p>
        </header>
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="font-heading text-xl font-semibold">{section.title}</h2>
            {section.body.map((block, i) =>
              Array.isArray(block) ? (
                <ul key={i} className="flex list-disc flex-col gap-1.5 pl-5 leading-relaxed">
                  {block.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="leading-relaxed text-pretty">
                  {block}
                </p>
              ),
            )}
          </section>
        ))}
      </article>
    </SiteShell>
  )
}
