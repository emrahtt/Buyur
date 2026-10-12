export type ModuleFlow = 'quote' | 'booking'
export type ModuleStatus = 'active' | 'coming_soon'

export type IconName =
  | 'sparkles'
  | 'home'
  | 'building'
  | 'truck'
  | 'hard-hat'
  | 'sofa'
  | 'scissors'
  | 'hammer'
  | 'wrench'
  | 'paint'
  | 'package'
  | 'zap'
  | 'droplets'

export type DetailField =
  | {
      type: 'select'
      name: string
      label: string
      options: { value: string; label: string }[]
      required?: boolean
    }
  | {
      type: 'number'
      name: string
      label: string
      min: number
      max: number
      suffix?: string
      required?: boolean
    }
  | {
      type: 'toggle'
      name: string
      label: string
      hint?: string
    }

export type ServicePackage = {
  slug: string
  name: string
  description: string
  priceMin: number
  priceMax: number
  includes: string[]
  popular?: boolean
}

export type ServiceCategory = {
  /** Must be globally unique across modules: used in /[ilce]/[kategori] SEO routes. */
  slug: string
  name: string
  short: string
  description: string
  icon: IconName
  fields: DetailField[]
  packages: ServicePackage[]
}

export type ModuleDefinition = {
  slug: string
  name: string
  tagline: string
  description: string
  flow: ModuleFlow
  status: ModuleStatus
  icon: IconName
  providerNoun: string
  requestNoun: string
  categories: ServiceCategory[]
  faq: { q: string; a: string }[]
}
