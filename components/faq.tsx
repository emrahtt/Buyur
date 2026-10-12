import { ChevronDown } from 'lucide-react'

export function Faq({ items, title = 'Sık sorulanlar' }: { items: { q: string; a: string }[]; title?: string }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="sss" className="mx-auto max-w-3xl px-4 py-12">
      <h2 id="sss" className="mb-6 text-3xl font-bold">
        {title}
      </h2>
      <div className="flex flex-col divide-y rounded-xl border bg-card">
        {items.map((item) => (
          <details key={item.q} className="group px-4">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="pb-4 leading-relaxed text-pretty text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from module config
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((i) => ({
              '@type': 'Question',
              name: i.q,
              acceptedAnswer: { '@type': 'Answer', text: i.a },
            })),
          }),
        }}
      />
    </section>
  )
}
