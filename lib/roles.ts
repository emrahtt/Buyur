export type Role = 'customer' | 'provider' | 'supervisor' | 'admin'
export type StaffRole = 'supervisor' | 'admin'

export const ROLE_LABELS: Record<Role, string> = {
  customer: 'Müşteri',
  provider: 'Hizmet veren',
  supervisor: 'Süpervizör',
  admin: 'Yönetici',
}

/** Demo accounts live under this domain so they can be removed together with the other demo data. */
export const DEMO_EMAIL_DOMAIN = 'demo.buyur.app'

export function isDemoEmail(email: string) {
  return email.trim().toLowerCase().endsWith(`@${DEMO_EMAIL_DOMAIN}`)
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.trim().toLowerCase())
}

type RoleSubject = { email: string; role?: string | null }

/** Admin access also follows ADMIN_EMAILS so accounts created before the variable was set still qualify. */
export function isAdmin(user: RoleSubject) {
  return user.role === 'admin' || isAdminEmail(user.email)
}

/** Staff can run day-to-day operations: approvals, matching and moderation. */
export function isStaff(user: RoleSubject) {
  return isAdmin(user) || user.role === 'supervisor'
}

export function staffRole(user: RoleSubject): StaffRole | null {
  if (isAdmin(user)) return 'admin'
  if (user.role === 'supervisor') return 'supervisor'
  return null
}
