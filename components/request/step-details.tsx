import { Camera, Minus, Plus, X } from 'lucide-react'
import { NativeSelect } from '@/components/native-select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { ServiceCategory } from '@/lib/modules'
import type { DetailValue, PhotoDraft, WizardState } from './types'

const MAX_PHOTOS = 4

export function StepDetails({
  category,
  state,
  errors,
  photos,
  onDetail,
  onDescription,
  onAddPhotos,
  onRemovePhoto,
}: {
  category: ServiceCategory
  state: WizardState
  errors: Record<string, string>
  photos: PhotoDraft[]
  onDetail: (name: string, value: DetailValue | undefined) => void
  onDescription: (value: string) => void
  onAddPhotos: (files: File[]) => void
  onRemovePhoto: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-2xl font-bold">Biraz detay</h2>

      {category.fields.map((field) => {
        const id = `d_${field.name}`
        const error = errors[id]
        if (field.type === 'select') {
          return (
            <div key={field.name} className="flex flex-col gap-2">
              <Label htmlFor={id} className="text-base">
                {field.label}
              </Label>
              <NativeSelect
                id={id}
                value={String(state.details[field.name] ?? '')}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-err` : undefined}
                onChange={(e) => onDetail(field.name, e.target.value || undefined)}
              >
                <option value="">Seç</option>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </NativeSelect>
              {error ? (
                <p id={`${id}-err`} className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
          )
        }
        if (field.type === 'number') {
          const value = Number(state.details[field.name] ?? field.min)
          return (
            <div key={field.name} className="flex items-center justify-between gap-4">
              <span id={`${id}-label`} className="text-base font-medium">
                {field.label}
              </span>
              <div role="group" aria-labelledby={`${id}-label`} className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Azalt"
                  disabled={value <= field.min}
                  onClick={() => onDetail(field.name, Math.max(field.min, value - 1))}
                >
                  <Minus />
                </Button>
                <output aria-live="polite" className="w-8 text-center font-heading text-xl font-semibold tabular-nums">
                  {value}
                </output>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Artır"
                  disabled={value >= field.max}
                  onClick={() => onDetail(field.name, Math.min(field.max, value + 1))}
                >
                  <Plus />
                </Button>
              </div>
            </div>
          )
        }
        return (
          <label
            key={field.name}
            className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3"
          >
            <span className="flex flex-col">
              <span className="text-base font-medium">{field.label}</span>
              {field.hint ? <span className="text-sm text-muted-foreground">{field.hint}</span> : null}
            </span>
            <Switch
              checked={Boolean(state.details[field.name])}
              onCheckedChange={(checked) => onDetail(field.name, checked)}
            />
          </label>
        )
      })}

      <div className="flex flex-col gap-2">
        <Label htmlFor="aciklama" className="text-base">
          Eklemek istediğin bir şey var mı?{' '}
          <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>
        </Label>
        <Textarea
          id="aciklama"
          rows={4}
          maxLength={1000}
          value={state.description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder="Örn: Kedimiz var, balkon camları da olsun, 3. kat asansörsüz."
          className="text-base leading-relaxed"
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-base font-medium">
          Fotoğraf <span className="font-normal text-muted-foreground">(en fazla {MAX_PHOTOS}, isteğe bağlı)</span>
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Fotoğraflarını yalnızca bölgendeki onaylı ekipler görür, herkese açık değildir.
        </p>
        <div className="grid grid-cols-4 gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg border">
              {/* Local object URL preview; next/image cannot optimise blob: URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => onRemovePhoto(p.id)}
                aria-label="Fotoğrafı kaldır"
                className="absolute top-0 right-0 flex size-11 items-start justify-end p-1"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-foreground/80 text-background">
                  <X className="size-3.5" />
                </span>
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
              <Camera aria-hidden="true" className="size-5" />
              <span className="text-xs font-medium">Ekle</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - photos.length)
                  onAddPhotos(files)
                  e.target.value = ''
                }}
              />
            </label>
          ) : null}
        </div>
      </div>
    </div>
  )
}
