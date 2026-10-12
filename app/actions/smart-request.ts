'use server'

import { generateText, Output } from 'ai'
import { z } from 'zod'
import { activeCategoryPairs, getCategory } from '@/lib/modules'
import { detailsSchema } from '@/lib/modules/validate'

export type SmartSuggestion = {
  moduleSlug: string
  categorySlug: string
  packageSlug: string | null
  details: Record<string, string | number | boolean>
  description: string
}

const MODEL = 'google/gemini-3.5-flash-lite'

export async function suggestFromText(text: string): Promise<SmartSuggestion | null> {
  const input = text.trim().slice(0, 400)
  if (input.length < 4) return null

  const pairs = activeCategoryPairs()
  const catalog = pairs
    .map(({ module, category }) => {
      const fields = category.fields
        .map((f) =>
          f.type === 'select'
            ? `${f.name} (one of: ${f.options.map((o) => o.value).join(', ')})`
            : f.type === 'number'
              ? `${f.name} (integer ${f.min}-${f.max})`
              : `${f.name} (boolean)`,
        )
        .join('; ')
      const packages = category.packages.map((p) => `${p.slug}: ${p.description}`).join(' | ')
      return `- module=${module.slug} category=${category.slug} "${category.name}": ${category.description}\n  fields: ${fields}\n  packages: ${packages}`
    })
    .join('\n')

  try {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({
        schema: z.object({
          categorySlug: z.enum(pairs.map((p) => p.category.slug) as [string, ...string[]]),
          packageSlug: z.string().nullable(),
          details: z.array(
            z.object({ name: z.string(), value: z.union([z.string(), z.number(), z.boolean()]) }),
          ),
          description: z
            .string()
            .describe('A short, polite Turkish summary of the job for the service provider.'),
        }),
      }),
      system:
        'You map a Turkish customer message to one cleaning service category on a local services marketplace. Only use field names and values from the catalog. Leave fields out if the message does not mention them.',
      prompt: `Catalog:\n${catalog}\n\nCustomer message: """${input}"""`,
    })

    const pair = pairs.find((p) => p.category.slug === output.categorySlug)
    if (!pair) return null
    const category = getCategory(pair.module.slug, pair.category.slug)!

    const rawDetails = Object.fromEntries(output.details.map((d) => [d.name, d.value]))
    const parsed = detailsSchema(category).partial().safeParse(rawDetails)
    const details = parsed.success
      ? (Object.fromEntries(
          Object.entries(parsed.data).filter(([, v]) => v !== undefined),
        ) as SmartSuggestion['details'])
      : {}

    const packageSlug = category.packages.some((p) => p.slug === output.packageSlug)
      ? output.packageSlug
      : (category.packages.find((p) => p.popular)?.slug ?? category.packages[0]?.slug ?? null)

    return {
      moduleSlug: pair.module.slug,
      categorySlug: category.slug,
      packageSlug,
      details,
      description: output.description.slice(0, 500),
    }
  } catch (error) {
    console.error('[smart-request] classification failed', error)
    return null
  }
}
