export type DetailValue = string | number | boolean

export type WizardState = {
  categorySlug: string | null
  packageSlug: string | null
  details: Record<string, DetailValue>
  description: string
  regionId: number | null
  preferredDate: string
  preferredTime: string
  recurring: string
  contactName: string
  contactPhone: string
  kvkk: boolean
  marketing: boolean
}

export type DistrictOption = {
  slug: string
  name: string
  regions: { id: number; name: string }[]
}

export type PhotoDraft = { id: string; file: File; url: string }
