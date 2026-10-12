export type Role = 'customer' | 'provider' | 'admin'

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.trim().toLowerCase())
}

/** Admin access also follows ADMIN_EMAILS so accounts created before the variable was set still qualify. */
export function isAdmin(user: { email: string; role?: string | null }) {
  return user.role === 'admin' || isAdminEmail(user.email)
}
