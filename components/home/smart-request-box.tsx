'use client'

import { ArrowRight, Loader2, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { type SmartSuggestion, suggestFromText } from '@/app/actions/smart-request'
import { Button, buttonVariants } from '@/components/ui/button'
import { formatTLRange } from '@/lib/format'
import { getCategory, getPackage } from '@/lib/modules'
import { describeDetails } from '@/lib/modules/validate'
import { buildRequestUrl } from '@/lib/request-url'
import { cn } from '@/lib/utils'

const EXAMPLES = ['2+1 ev, haftalık temizlik', 'Taşınma sonrası 3+1, camlar dahil', 'Köşe koltuk yıkatmak istiyorum']

export function SmartRequestBox() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<SmartSuggestion | null | 'miss'>(null)
  const [pending, startTransition] = useTransition()

  function submit(value: string) {
    if (value.trim().length < 4) return
    startTransition(async () => {
      const suggestion = await suggestFromText(value)
      setResult(suggestion ?? 'miss')
    })
  }

  const category =
    result && result !== 'miss' ? getCategory(result.moduleSlug, result.categorySlug) : undefined
  const pkg =
    result && result !== 'miss'
      ? getPackage(result.moduleSlug, result.categorySlug, result.packageSlug)
      : undefined

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(text)
        }}
        className="flex flex-col gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30"
      >
        <label htmlFor="akilli-talep" className="sr-only">
          Ne lazım? Kendi cümlenle yaz
        </label>
        <textarea
          id="akilli-talep"
          rows={2}
          maxLength={400}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ne lazım? Örn: 3+1 ev, taşınma sonrası, camlar dahil"
          className="min-h-16 w-full resize-none bg-transparent px-2 pt-2 text-base leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 text-xs text-muted-foreground">Yaz, kategorini ve fiyat bandını önerelim.</span>
          <Button type="submit" disabled={pending || text.trim().length < 4}>
            {pending ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Wand2 data-icon="inline-start" />
            )}
            Öner
          </Button>
        </div>
      </form>

      {result === null ? (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setText(example)
                submit(example)
              }}
              className="min-h-11 rounded-full border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>
      ) : null}

      <div aria-live="polite">
        {result === 'miss' ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed bg-card p-4">
            <p className="text-sm leading-relaxed">
              Tam anlayamadık, sorun değil. Kategoriyi birkaç dokunuşla kendin seç.
            </p>
            <Link
              href={buildRequestUrl({ moduleSlug: 'temizlik', description: text })}
              className={cn(buttonVariants(), 'self-start')}
            >
              Talep formuna geç
              <ArrowRight data-icon="inline-end" />
            </Link>
          </div>
        ) : null}

        {result && result !== 'miss' && category ? (
          <div className="flex animate-rise flex-col gap-3 rounded-2xl border-2 border-primary/30 bg-card p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Önerimiz</span>
              <p className="font-heading text-lg font-semibold">
                {category.name}
                {pkg ? <span className="text-muted-foreground"> · {pkg.name}</span> : null}
              </p>
              {pkg ? (
                <p className="text-sm text-muted-foreground">
                  Mahallede bu iş genelde{' '}
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatTLRange(pkg.priceMin, pkg.priceMax)}
                  </span>
                </p>
              ) : null}
            </div>
            {describeDetails(category, result.details).length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {describeDetails(category, result.details).map((d) => (
                  <li key={d.label} className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                    {d.label}: {d.value}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Link href={buildRequestUrl(result)} className={buttonVariants()}>
                Bu talebi aç
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Button variant="ghost" onClick={() => setResult(null)}>
                Değiştir
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
