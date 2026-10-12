import { ModuleIcon } from '@/components/module-icon'
import { formatTLRange } from '@/lib/format'
import type { ModuleDefinition } from '@/lib/modules'
import { ChoiceCard } from './choice-card'
import type { WizardState } from './types'

export function StepService({
  module,
  state,
  onCategory,
  onPackage,
}: {
  module: ModuleDefinition
  state: WizardState
  onCategory: (slug: string) => void
  onPackage: (slug: string | null) => void
}) {
  const category = module.categories.find((c) => c.slug === state.categorySlug)

  return (
    <div className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 font-heading text-2xl font-bold">Ne tür bir temizlik?</legend>
        {module.categories.map((c) => (
          <ChoiceCard
            key={c.slug}
            name="kategori"
            value={c.slug}
            checked={state.categorySlug === c.slug}
            onChange={onCategory}
          >
            <span className="flex items-center gap-2 font-heading text-lg font-semibold">
              <ModuleIcon name={c.icon} className="size-4 text-primary" />
              {c.name}
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">{c.short}</span>
          </ChoiceCard>
        ))}
      </fieldset>

      {category && category.packages.length > 0 ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-heading text-xl font-bold">Buyur Paket</legend>
          <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
            Fiyat bandı mahalledeki gerçek tekliflerden çıkar. Kesin fiyatı ekipler verir.
          </p>
          {category.packages.map((p) => (
            <ChoiceCard
              key={p.slug}
              name="paket"
              value={p.slug}
              checked={state.packageSlug === p.slug}
              onChange={onPackage}
            >
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-heading text-lg font-semibold">{p.name}</span>
                <span className="font-semibold tabular-nums text-primary">
                  {formatTLRange(p.priceMin, p.priceMax)}
                </span>
              </span>
              <span className="text-sm text-muted-foreground">{p.description}</span>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {p.includes.map((item) => (
                  <li key={item} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </ChoiceCard>
          ))}
          <ChoiceCard
            name="paket"
            value=""
            checked={state.packageSlug === null}
            onChange={() => onPackage(null)}
          >
            <span className="font-medium">Emin değilim, ekipler önersin</span>
          </ChoiceCard>
        </fieldset>
      ) : null}
    </div>
  )
}
