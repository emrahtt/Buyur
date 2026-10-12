'use client'

import { Camera, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { type ProviderProfileInput, saveProviderProfile } from '@/app/actions/provider'
import { ProviderAvatar } from '@/components/provider-avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatTLRange } from '@/lib/format'

type CategoryOption = {
  slug: string
  name: string
  short: string
  band: { min: number; max: number } | null
}

type ServiceDraft = { priceMin: string; priceMax: string }

export type ProfileFormInitial = {
  displayName: string
  bio: string
  phone: string
  whatsapp: string
  services: Record<string, ServiceDraft>
  regionIds: number[]
  slug: string | null
  hasAvatar: boolean
}

export function ProviderProfileForm({
  categories,
  districts,
  initial,
  isNew,
}: {
  categories: CategoryOption[]
  districts: { slug: string; name: string; regions: { id: number; name: string }[] }[]
  initial: ProfileFormInitial
  isNew: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [displayName, setDisplayName] = useState(initial.displayName)
  const [bio, setBio] = useState(initial.bio)
  const [phone, setPhone] = useState(initial.phone)
  const [whatsapp, setWhatsapp] = useState(initial.whatsapp)
  const [services, setServices] = useState<Record<string, ServiceDraft>>(initial.services)
  const [regionIds, setRegionIds] = useState<Set<number>>(new Set(initial.regionIds))
  const [terms, setTerms] = useState(!isNew)
  const [uploading, setUploading] = useState(false)
  const [avatarVersion, setAvatarVersion] = useState(0)
  const [hasAvatar, setHasAvatar] = useState(initial.hasAvatar)

  function toggleRegion(id: number, on: boolean) {
    setRegionIds((set) => {
      const next = new Set(set)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function submit() {
    const input: ProviderProfileInput = {
      displayName,
      bio,
      phone,
      whatsapp,
      services: Object.entries(services).map(([categorySlug, s]) => ({
        categorySlug,
        priceMin: s.priceMin ? Number(s.priceMin) : null,
        priceMax: s.priceMax ? Number(s.priceMax) : null,
      })),
      regionIds: [...regionIds],
      termsAccepted: terms as true,
    }
    startTransition(async () => {
      const result = await saveProviderProfile(input)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(isNew ? 'Profilin oluşturuldu. Onay sürecini başlattık.' : 'Profilin güncellendi.')
      router.push('/veren')
      router.refresh()
    })
  }

  async function uploadAvatar(file: File) {
    setUploading(true)
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/veren/avatar', { method: 'POST', body })
    setUploading(false)
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      toast.error(data.error ?? 'Fotoğraf yüklenemedi.')
      return
    }
    setHasAvatar(true)
    setAvatarVersion((v) => v + 1)
    toast.success('Fotoğraf güncellendi.')
  }

  return (
    <form
      className="flex flex-col gap-10"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <section aria-labelledby="ekip" className="flex flex-col gap-5">
        <h2 id="ekip" className="font-heading text-xl font-bold">
          Ekip bilgisi
        </h2>
        {initial.slug ? (
          <div className="flex items-center gap-4">
            <ProviderAvatar
              key={avatarVersion}
              slug={initial.slug}
              name={displayName || 'Ekip'}
              hasAvatar={hasAvatar}
              className="size-16"
            />
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              Profil fotoğrafı
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadAvatar(file)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="displayName" className="text-base">
            Ekip ya da işletme adı
          </Label>
          <Input
            id="displayName"
            required
            minLength={3}
            maxLength={60}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Örn: Kartaltepe Temizlik Ekibi"
            className="h-12 text-base"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bio" className="text-base">
            Kısaca kendinizi anlatın
          </Label>
          <Textarea
            id="bio"
            rows={4}
            maxLength={600}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Kaç kişisiniz, kaç yıldır bu işi yapıyorsunuz, neye özen gösterirsiniz?"
            className="text-base leading-relaxed"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone" className="text-base">
              Telefon
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xx xxx xx xx"
              className="h-12 text-base"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="whatsapp" className="text-base">
              WhatsApp <span className="font-normal text-muted-foreground">(farklıysa)</span>
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Boşsa telefonun kullanılır"
              className="h-12 text-base"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="hizmetler" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="hizmetler" className="font-heading text-xl font-bold">
            Hangi işleri yapıyorsunuz?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Kendi fiyat bandınızı yazabilirsiniz; boş bırakırsanız Buyur Paket bandı görünür.
          </p>
        </div>
        {categories.map((c) => {
          const selected = services[c.slug]
          return (
            <div key={c.slug} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <Checkbox
                  checked={Boolean(selected)}
                  onCheckedChange={(checked) =>
                    setServices((s) => {
                      const next = { ...s }
                      if (checked) next[c.slug] = { priceMin: '', priceMax: '' }
                      else delete next[c.slug]
                      return next
                    })
                  }
                  className="mt-0.5 size-5"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {c.short}
                    {c.band ? ` · ${formatTLRange(c.band.min, c.band.max)}` : ''}
                  </span>
                </span>
              </label>
              {selected ? (
                <div className="grid grid-cols-2 gap-3 pl-8">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`${c.slug}-min`} className="text-xs text-muted-foreground">
                      En az (TL)
                    </Label>
                    <Input
                      id={`${c.slug}-min`}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={selected.priceMin}
                      onChange={(e) =>
                        setServices((s) => ({
                          ...s,
                          [c.slug]: { ...s[c.slug], priceMin: e.target.value.replace(/\D/g, '') },
                        }))
                      }
                      className="h-11 text-base tabular-nums"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`${c.slug}-max`} className="text-xs text-muted-foreground">
                      En çok (TL)
                    </Label>
                    <Input
                      id={`${c.slug}-max`}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={selected.priceMax}
                      onChange={(e) =>
                        setServices((s) => ({
                          ...s,
                          [c.slug]: { ...s[c.slug], priceMax: e.target.value.replace(/\D/g, '') },
                        }))
                      }
                      className="h-11 text-base tabular-nums"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </section>

      <section aria-labelledby="bolgeler" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="bolgeler" className="font-heading text-xl font-bold">
            Hangi mahallelere gidiyorsunuz?
          </h2>
          <p className="text-sm text-muted-foreground">{regionIds.size} mahalle seçili</p>
        </div>
        {districts.map((d) => {
          const all = d.regions.every((r) => regionIds.has(r.id))
          return (
            <fieldset key={d.slug} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
              <legend className="sr-only">{d.name}</legend>
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading font-semibold">{d.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => d.regions.forEach((r) => toggleRegion(r.id, !all))}
                >
                  {all ? 'Hiçbiri' : 'Tümü'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-3">
                {d.regions.map((r) => (
                  <label key={r.id} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={regionIds.has(r.id)}
                      onCheckedChange={(checked) => toggleRegion(r.id, checked === true)}
                      className="size-5"
                    />
                    {r.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )
        })}
      </section>

      {isNew ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4">
          <Checkbox checked={terms} onCheckedChange={(checked) => setTerms(checked === true)} className="mt-0.5 size-5" />
          <span className="text-sm leading-relaxed">
            <Link href="/kosullar" target="_blank" className="font-medium text-primary underline underline-offset-4">
              Hizmet veren koşullarını
            </Link>{' '}
            ve{' '}
            <Link href="/kvkk" target="_blank" className="font-medium text-primary underline underline-offset-4">
              KVKK Aydınlatma Metni
            </Link>
            ’ni okudum. Müşteri bilgilerini yalnızca ilgili iş için kullanacağımı kabul ediyorum.
          </span>
        </label>
      ) : null}

      <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 pt-3 backdrop-blur pb-safe">
        <Button type="submit" size="lg" className="w-full" disabled={pending || (isNew && !terms)}>
          {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
          {isNew ? 'Profilimi oluştur' : 'Kaydet'}
        </Button>
      </div>
    </form>
  )
}
