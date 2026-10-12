import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate, formatTLRange, labelFor, RECURRING_OPTIONS, TIME_SLOTS } from '@/lib/format'
import type { ModuleDefinition } from '@/lib/modules'
import { describeDetails } from '@/lib/modules/validate'
import type { DistrictOption, WizardState } from './types'

export function StepContact({
  module,
  state,
  errors,
  districts,
  update,
}: {
  module: ModuleDefinition
  state: WizardState
  errors: Record<string, string>
  districts: DistrictOption[]
  update: (patch: Partial<WizardState>) => void
}) {
  const category = module.categories.find((c) => c.slug === state.categorySlug)
  const pkg = category?.packages.find((p) => p.slug === state.packageSlug)
  const region = districts.flatMap((d) => d.regions.map((r) => ({ ...r, district: d.name }))).find((r) => r.id === state.regionId)

  return (
    <div className="flex flex-col gap-7">
      <h2 className="font-heading text-2xl font-bold">Sana nasıl ulaşalım?</h2>

      <section aria-label="Talep özeti" className="flex flex-col gap-2 rounded-xl border bg-secondary/50 p-4 text-sm">
        <p className="font-heading text-base font-semibold">
          {category?.name}
          {pkg ? <span className="font-normal text-muted-foreground"> · {pkg.name}</span> : null}
        </p>
        {pkg ? <p className="tabular-nums">{formatTLRange(pkg.priceMin, pkg.priceMax)}</p> : null}
        <p className="text-muted-foreground">
          {region ? `${region.name}, ${region.district}` : null} ·{' '}
          {state.preferredDate ? formatDate(state.preferredDate) : 'Tarih esnek'} ·{' '}
          {labelFor(TIME_SLOTS, state.preferredTime)} · {labelFor(RECURRING_OPTIONS, state.recurring)}
        </p>
        {category ? (
          <p className="text-muted-foreground">
            {describeDetails(category, state.details)
              .map((d) => `${d.label}: ${d.value}`)
              .join(' · ')}
          </p>
        ) : null}
      </section>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ad" className="text-base">
          Adın soyadın
        </Label>
        <Input
          id="ad"
          autoComplete="name"
          value={state.contactName}
          aria-invalid={Boolean(errors.contactName)}
          onChange={(e) => update({ contactName: e.target.value })}
          className="h-12 text-base"
        />
        {errors.contactName ? <p className="text-sm text-destructive">{errors.contactName}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="telefon" className="text-base">
          Cep telefonu
        </Label>
        <Input
          id="telefon"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="05xx xxx xx xx"
          value={state.contactPhone}
          aria-invalid={Boolean(errors.contactPhone)}
          aria-describedby="telefon-hint"
          onChange={(e) => update({ contactPhone: e.target.value })}
          className="h-12 text-base"
        />
        {errors.contactPhone ? (
          <p className="text-sm text-destructive">{errors.contactPhone}</p>
        ) : (
          <p id="telefon-hint" className="text-sm text-muted-foreground">
            Numaran yalnızca teklifini kabul ettiğin ekiple paylaşılır.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4">
          <Checkbox
            checked={state.kvkk}
            onCheckedChange={(checked) => update({ kvkk: checked === true })}
            aria-invalid={Boolean(errors.kvkkAcknowledged)}
            className="mt-0.5 size-5"
          />
          <span className="text-sm leading-relaxed">
            <Link href="/kvkk" target="_blank" className="font-medium text-primary underline underline-offset-4">
              KVKK Aydınlatma Metni
            </Link>
            ’ni okudum. Talebimin bölgemdeki hizmet verenlere iletilmesi için bilgilerimin işleneceğini biliyorum.
          </span>
        </label>
        {errors.kvkkAcknowledged ? (
          <p className="text-sm text-destructive">{errors.kvkkAcknowledged}</p>
        ) : null}

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4">
          <Checkbox
            checked={state.marketing}
            onCheckedChange={(checked) => update({ marketing: checked === true })}
            className="mt-0.5 size-5"
          />
          <span className="text-sm leading-relaxed">
            Buyur’dan kampanya ve yeni hizmet duyuruları almak istiyorum.{' '}
            <span className="text-muted-foreground">(İsteğe bağlı, istediğin zaman vazgeçebilirsin.)</span>
          </span>
        </label>
      </div>
    </div>
  )
}
