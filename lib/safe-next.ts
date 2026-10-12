/** Only same-origin relative paths; blocks `//evil.com` and `/\evil.com` open redirects. */
export function safeNext(value: string | null | undefined, fallback = '/panel') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  return value
}
