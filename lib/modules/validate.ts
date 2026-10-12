import { z } from 'zod'
import type { DetailField, ServiceCategory } from './types'

function fieldSchema(field: DetailField) {
  switch (field.type) {
    case 'select': {
      const values = field.options.map((o) => o.value) as [string, ...string[]]
      const s = z.enum(values)
      return field.required ? s : s.optional()
    }
    case 'number': {
      const s = z.coerce.number().int().min(field.min).max(field.max)
      return field.required ? s : s.optional()
    }
    case 'toggle':
      return z.boolean().default(false)
  }
}

/** Builds the zod schema for a category's module-specific `requests.details`. Unknown keys are dropped. */
export function detailsSchema(category: ServiceCategory) {
  const shape: Record<string, z.ZodType> = {}
  for (const field of category.fields) shape[field.name] = fieldSchema(field)
  return z.object(shape)
}

export function describeDetails(category: ServiceCategory, details: Record<string, unknown>) {
  return category.fields.flatMap((field) => {
    const value = details[field.name]
    if (value === undefined || value === null || value === '') return []
    if (field.type === 'toggle') return value ? [{ label: field.label, value: 'Evet' }] : []
    if (field.type === 'select') {
      const option = field.options.find((o) => o.value === value)
      return [{ label: field.label, value: option?.label ?? String(value) }]
    }
    return [{ label: field.label, value: `${value}${field.suffix ? ` ${field.suffix}` : ''}` }]
  })
}
