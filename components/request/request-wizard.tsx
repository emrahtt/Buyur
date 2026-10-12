'use client'

import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { createRequest } from '@/app/actions/requests'
import { Button } from '@/components/ui/button'
import { normalizePhone } from '@/lib/format'
import { tr } from '@/lib/i18n/tr'
import type { ModuleDefinition, ServiceCategory } from '@/lib/modules'
import { StepContact } from './step-contact'
import { StepDetails } from './step-details'
import { StepService } from './step-service'
import { StepWhenWhere } from './step-when-where'
import type { DetailValue, DistrictOption, PhotoDraft, WizardState } from './types'

const STEPS = ['Hizmet', 'Detaylar', 'Zaman ve yer', 'İletişim'] as const

const FIELD_STEP: Record<string, number> = {
  categorySlug: 0,
  regionId: 2,
  preferredDate: 2,
  contactName: 3,
  contactPhone: 3,
  kvkkAcknowledged: 3,
}

function withNumberDefaults(category: ServiceCategory | undefined, details: Record<string, DetailValue>) {
  if (!category) return details
  const next: Record<string, DetailValue> = {}
  for (const field of category.fields) {
    const value = details[field.name]
    if (value !== undefined) next[field.name] = value
    else if (field.type === 'number') next[field.name] = field.min
  }
  return next
}

export function RequestWizard({
  module,
  districts,
  initial,
}: {
  module: ModuleDefinition
  districts: DistrictOption[]
  initial: WizardState
}) {
  const router = useRouter()
  const [step, setStep] = useState(initial.categorySlug ? 1 : 0)
  const [state, setState] = useState<WizardState>(() => ({
    ...initial,
    details: withNumberDefaults(
      module.categories.find((c) => c.slug === initial.categorySlug),
      initial.details,
    ),
  }))
  const [photos, setPhotos] = useState<PhotoDraft[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [website, setWebsite] = useState('')
  const headingRef = useRef<HTMLDivElement>(null)
  const photosRef = useRef(photos)
  photosRef.current = photos

  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), [])

  const category = module.categories.find((c) => c.slug === state.categorySlug)

  function update(patch: Partial<WizardState>) {
    setState((s) => ({ ...s, ...patch }))
    setErrors((e) => {
      const next = { ...e }
      for (const key of Object.keys(patch)) delete next[key === 'kvkk' ? 'kvkkAcknowledged' : key]
      return next
    })
  }

  function goTo(next: number) {
    setStep(next)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      headingRef.current?.focus({ preventScroll: true })
    })
  }

  function validate(index: number) {
    const e: Record<string, string> = {}
    if (index === 0 && !state.categorySlug) e.categorySlug = 'Bir hizmet seç'
    if (index === 1 && category) {
      for (const field of category.fields) {
        if ('required' in field && field.required && (state.details[field.name] ?? '') === '') {
          e[`d_${field.name}`] = 'Bu alanı doldur'
        }
      }
    }
    if (index === 2 && !state.regionId) e.regionId = 'Mahalleni seç'
    if (index === 3) {
      if (state.contactName.trim().length < 2) e.contactName = 'Adını yaz'
      if (!normalizePhone(state.contactPhone)) e.contactPhone = '05xx ile başlayan cep numaranı yaz'
      if (!state.kvkk) e.kvkkAcknowledged = 'Devam etmek için onaylaman gerekiyor'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit() {
    if (!validate(3) || !category) return
    setSubmitting(true)
    try {
      const result = await createRequest({
        moduleSlug: module.slug,
        categorySlug: category.slug,
        packageSlug: state.packageSlug,
        regionId: state.regionId ?? 0,
        description: state.description,
        details: state.details,
        preferredDate: state.preferredDate || null,
        preferredTime: state.preferredTime,
        recurring: state.recurring,
        contactName: state.contactName,
        contactPhone: state.contactPhone,
        kvkkAcknowledged: state.kvkk as true,
        marketingConsent: state.marketing,
        website,
      })
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        const firstField = Object.keys(result.fieldErrors ?? {})[0]
        if (firstField) goTo(firstField.startsWith('d_') ? 1 : (FIELD_STEP[firstField] ?? 3))
        setSubmitting(false)
        return
      }

      const token = result.data.token
      let failed = 0
      for (const photo of photos) {
        const body = new FormData()
        body.append('file', photo.file)
        const res = await fetch(`/api/talep/${token}/foto`, { method: 'POST', body })
        if (!res.ok) failed += 1
      }
      if (failed > 0) toast.warning(`${failed} fotoğraf yüklenemedi; talebin yine de oluşturuldu.`)
      router.push(`/talep/${token}?yeni=1`)
    } catch {
      toast.error(tr.errors.generic)
      setSubmitting(false)
    }
  }

  const isLast = step === STEPS.length - 1

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col px-4 pt-4 pb-32">
      <div
        ref={headingRef}
        tabIndex={-1}
        className="mb-6 flex flex-col gap-2 outline-none"
        aria-live="polite"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {STEPS[step]}
          </span>
          <span className="text-muted-foreground tabular-nums">
            Adım {step + 1} / {STEPS.length}
          </span>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>
      </div>

      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {step === 0 ? (
        <>
          <StepService
            module={module}
            state={state}
            onCategory={(slug) => {
              const next = module.categories.find((c) => c.slug === slug)
              setState((s) => ({
                ...s,
                categorySlug: slug,
                packageSlug: next?.packages.find((p) => p.popular)?.slug ?? next?.packages[0]?.slug ?? null,
                details: withNumberDefaults(next, s.details),
              }))
              setErrors({})
            }}
            onPackage={(slug) => update({ packageSlug: slug })}
          />
          {errors.categorySlug ? <p className="mt-3 text-sm text-destructive">{errors.categorySlug}</p> : null}
        </>
      ) : null}

      {step === 1 && category ? (
        <StepDetails
          category={category}
          state={state}
          errors={errors}
          photos={photos}
          onDetail={(name, value) => {
            setState((s) => {
              const details = { ...s.details }
              if (value === undefined) delete details[name]
              else details[name] = value
              return { ...s, details }
            })
            setErrors((e) => {
              const { [`d_${name}`]: _removed, ...rest } = e
              return rest
            })
          }}
          onDescription={(description) => update({ description })}
          onAddPhotos={(files) =>
            setPhotos((list) => [
              ...list,
              ...files.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) })),
            ])
          }
          onRemovePhoto={(id) =>
            setPhotos((list) => {
              const target = list.find((p) => p.id === id)
              if (target) URL.revokeObjectURL(target.url)
              return list.filter((p) => p.id !== id)
            })
          }
        />
      ) : null}

      {step === 2 ? (
        <StepWhenWhere state={state} errors={errors} districts={districts} update={update} />
      ) : null}

      {step === 3 ? (
        <StepContact module={module} state={state} errors={errors} districts={districts} update={update} />
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur pb-safe">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 pt-3">
          {step > 0 ? (
            <Button variant="outline" size="lg" onClick={() => goTo(step - 1)} disabled={submitting}>
              <ArrowLeft data-icon="inline-start" />
              Geri
            </Button>
          ) : null}
          {isLast ? (
            <Button size="lg" className="flex-1" onClick={submit} disabled={submitting}>
              {submitting ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Send data-icon="inline-start" />}
              {submitting ? 'Gönderiliyor' : 'Talebi gönder'}
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                if (validate(step)) goTo(step + 1)
              }}
            >
              Devam
              <ArrowRight data-icon="inline-end" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
