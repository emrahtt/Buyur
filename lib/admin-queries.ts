import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

export async function getKpis() {
  const result = await db.execute<{
    total: number
    last30: number
    open: number
    matched: number
    completed: number
    cancelled: number
    avg_first_offer_min: number | null
    repeat_rate: number | null
    pending_providers: number
    approved_providers: number
    waitlist: number
  }>(sql`
    WITH r AS (SELECT * FROM requests WHERE is_demo = false),
    firsts AS (
      SELECT r.id, EXTRACT(EPOCH FROM (min(o.created_at) - r.created_at)) / 60 AS minutes
      FROM r JOIN offers o ON o.request_id = r.id
      GROUP BY r.id, r.created_at
    ),
    phones AS (SELECT contact_phone, count(*) AS n FROM r GROUP BY contact_phone)
    SELECT
      (SELECT count(*)::int FROM r) AS total,
      (SELECT count(*)::int FROM r WHERE created_at > now() - interval '30 days') AS last30,
      (SELECT count(*)::int FROM r WHERE status = 'open') AS open,
      (SELECT count(*)::int FROM r WHERE status = 'matched') AS matched,
      (SELECT count(*)::int FROM r WHERE status = 'completed') AS completed,
      (SELECT count(*)::int FROM r WHERE status = 'cancelled') AS cancelled,
      (SELECT round(avg(minutes))::int FROM firsts) AS avg_first_offer_min,
      (SELECT CASE WHEN count(*) = 0 THEN NULL ELSE round(100.0 * count(*) FILTER (WHERE n > 1) / count(*))::int END FROM phones) AS repeat_rate,
      (SELECT count(*)::int FROM provider_profiles WHERE verification_status = 'pending') AS pending_providers,
      (SELECT count(*)::int FROM provider_profiles WHERE verification_status = 'approved') AS approved_providers,
      (SELECT count(*)::int FROM waitlist) AS waitlist
  `)
  const k = result.rows[0]
  const decided = k.total - k.cancelled
  return {
    ...k,
    matchRate: decided > 0 ? Math.round((100 * (k.matched + k.completed)) / decided) : null,
  }
}

export async function getDailyRequests(days = 14) {
  const result = await db.execute<{ day: string; requests: number; offers: number }>(sql`
    SELECT to_char(d, 'YYYY-MM-DD') AS day,
      (SELECT count(*)::int FROM requests r WHERE r.is_demo = false AND r.created_at::date = d::date) AS requests,
      (SELECT count(*)::int FROM offers o WHERE o.created_at::date = d::date) AS offers
    FROM generate_series(current_date - ${days - 1}::int, current_date, interval '1 day') AS d
    ORDER BY d
  `)
  return result.rows
}

export async function getCategoryBreakdown() {
  const result = await db.execute<{ category_slug: string; module_slug: string; n: number }>(sql`
    SELECT module_slug, category_slug, count(*)::int AS n
    FROM requests WHERE is_demo = false
    GROUP BY module_slug, category_slug ORDER BY n DESC
  `)
  return result.rows
}

export async function getWaitlistSummary() {
  const result = await db.execute<{ module_slug: string; n: number }>(sql`
    SELECT module_slug, count(*)::int AS n FROM waitlist GROUP BY module_slug ORDER BY n DESC
  `)
  return result.rows
}
