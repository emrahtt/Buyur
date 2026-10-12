import { NativeSelect } from '@/components/native-select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RECURRING_OPTIONS, TIME_SLOTS } from '@/lib/format'
import { ChoiceChip } from './choice-card'
import type { DistrictOption, WizardState } from './types'

function isoDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function StepWhenWhere({
  state,
  errors,
  districts,
  update,
}: {
  state: WizardState
  errors: Record<string, string>
  districts: DistrictOption[]
  update: (patch: Partial<WizardState>) => void
}) {
  const today = new Date()
  const max = new Date()
  max.setDate(max.getDate() + 60)

  return (
    <div className="flex flex-col gap-7">
      <h2 className="font-heading text-2xl font-bold">Nerede, ne zaman?</h2>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bolge" className="text-base">
          Mahalle
        </Label>
        <NativeSelect
          id="bolge"
          value={state.regionId ?? ''}
          aria-invalid={Boolean(errors.regionId)}
          aria-describedby={errors.regionId ? 'bolge-err' : 'bolge-hint'}
          onChange={(e) => update({ regionId: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">Mahalleni seç</option>
          {districts.map((d) => (
            <optgroup key={d.slug} label={d.name}>
              {d.regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
          ))}
        </NativeSelect>
        {errors.regionId ? (
          <p id="bolge-err" className="text-sm text-destructive">
            {errors.regionId}
          </p>
        ) : (
          <p id="bolge-hint" className="text-sm text-muted-foreground">
            Açık adresini yalnızca seçtiğin ekiple paylaşırsın.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tarih" className="text-base">
          Tarih <span className="font-normal text-muted-foreground">(boş bırakırsan esnek)</span>
        </Label>
        <Input
          id="tarih"
          type="date"
          min={isoDate(today)}
          max={isoDate(max)}
          value={state.preferredDate}
          aria-invalid={Boolean(errors.preferredDate)}
          onChange={(e) => update({ preferredDate: e.target.value })}
          className="h-12 text-base"
        />
        {errors.preferredDate ? <p className="text-sm text-destructive">{errors.preferredDate}</p> : null}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-base font-medium">Saat aralığı</legend>
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map((slot) => (
            <ChoiceChip
              key={slot.value}
              name="saat"
              value={slot.value}
              checked={state.preferredTime === slot.value}
              onChange={(v) => update({ preferredTime: v })}
            >
              {slot.label}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-base font-medium">Ne sıklıkla?</legend>
        <p className="mb-2 text-sm text-muted-foreground">Düzenli temizlikte aynı ekip gelir.</p>
        <div className="flex flex-wrap gap-2">
          {RECURRING_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.value}
              name="siklik"
              value={option.value}
              checked={state.recurring === option.value}
              onChange={(v) => update({ recurring: v })}
            >
              {option.label}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
