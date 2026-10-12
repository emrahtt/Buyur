import { temizlik } from './temizlik'
import { berberKuafor, nakliye, tadilat, tamirBakim } from './upcoming'
import type { ModuleDefinition, ServiceCategory } from './types'

export type * from './types'

/**
 * The single registry of verticals. Adding a sector = adding a definition here.
 * Every page, form, SEO route and admin filter is derived from this list.
 */
export const MODULES: ModuleDefinition[] = [temizlik, berberKuafor, tadilat, nakliye, tamirBakim]

export const ACTIVE_MODULES = MODULES.filter((m) => m.status === 'active')
export const UPCOMING_MODULES = MODULES.filter((m) => m.status === 'coming_soon')

export function getModule(slug: string) {
  return MODULES.find((m) => m.slug === slug)
}

export function getCategory(moduleSlug: string, categorySlug: string) {
  return getModule(moduleSlug)?.categories.find((c) => c.slug === categorySlug)
}

export function findCategoryBySlug(
  categorySlug: string,
): { module: ModuleDefinition; category: ServiceCategory } | undefined {
  for (const module of MODULES) {
    const category = module.categories.find((c) => c.slug === categorySlug)
    if (category) return { module, category }
  }
  return undefined
}

export function getPackage(moduleSlug: string, categorySlug: string, packageSlug?: string | null) {
  if (!packageSlug) return undefined
  return getCategory(moduleSlug, categorySlug)?.packages.find((p) => p.slug === packageSlug)
}

export function activeCategoryPairs() {
  return ACTIVE_MODULES.flatMap((module) =>
    module.categories.map((category) => ({ module, category })),
  )
}

export function categoryPriceRange(category: ServiceCategory) {
  if (category.packages.length === 0) return null
  return {
    min: Math.min(...category.packages.map((p) => p.priceMin)),
    max: Math.max(...category.packages.map((p) => p.priceMax)),
  }
}
