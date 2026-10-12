import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { buyurPool?: Pool }

export const pool =
  globalForDb.buyurPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })

if (process.env.NODE_ENV !== 'production') globalForDb.buyurPool = pool

export const db = drizzle(pool, { schema })
