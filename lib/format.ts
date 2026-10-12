// Neither brand font ships the ₺ glyph, so prices use the "TL" suffix to render everywhere.
const amount = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 })

export function formatTL(value: number) {
  return `${amount.format(value)} TL`
}

export function formatTLRange(min: number, max: number) {
  return `${amount.format(min)} – ${amount.format(max)} TL`
}

/** Normalises Turkish mobile numbers to 90XXXXXXXXXX, or null when invalid. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  let local = digits
  if (local.startsWith('90')) local = local.slice(2)
  if (local.startsWith('0')) local = local.slice(1)
  if (!/^5\d{9}$/.test(local)) return null
  return `90${local}`
}

export function displayPhone(normalized: string) {
  const local = normalized.startsWith('90') ? normalized.slice(2) : normalized
  return `0${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8)}`
}

export function maskPhone(normalized: string) {
  const local = normalized.startsWith('90') ? normalized.slice(2) : normalized
  return `0${local.slice(0, 3)} *** ** ${local.slice(8)}`
}

export function whatsappLink(phone: string, text?: string) {
  const base = `https://wa.me/${phone}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })
const shortDateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' })

export function formatDate(value: string | Date) {
  const d = typeof value === 'string' ? new Date(`${value}T12:00:00`) : value
  return dateFmt.format(d)
}

export function formatShortDate(value: Date) {
  return shortDateFmt.format(value)
}

export function formatTime(value: Date) {
  return timeFmt.format(value)
}

const rtf = new Intl.RelativeTimeFormat('tr-TR', { numeric: 'auto' })

export function timeAgo(value: Date) {
  const diff = (value.getTime() - Date.now()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return 'az önce'
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}

export function slugify(input: string) {
  const map: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u' }
  return input
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıİöşü]/g, (ch) => map[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export const TIME_SLOTS = [
  { value: 'sabah', label: 'Sabah (08–12)' },
  { value: 'ogle', label: 'Öğle (12–16)' },
  { value: 'aksam', label: 'Akşamüstü (16–20)' },
  { value: 'esnek', label: 'Fark etmez' },
] as const

export const RECURRING_OPTIONS = [
  { value: 'none', label: 'Tek seferlik' },
  { value: 'weekly', label: 'Her hafta' },
  { value: 'biweekly', label: '2 haftada bir' },
  { value: 'monthly', label: 'Ayda bir' },
] as const

export function labelFor<T extends readonly { value: string; label: string }[]>(
  list: T,
  value: string | null | undefined,
) {
  return list.find((i) => i.value === value)?.label ?? value ?? ''
}
