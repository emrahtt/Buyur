import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
  time,
  timestamp,
} from 'drizzle-orm/pg-core'

// ---------- Better Auth tables (camelCase columns match Better Auth defaults) ----------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('customer'),
  phone: text('phone'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// ---------- Buyur app tables ----------

export const regions = pgTable('regions', {
  id: serial('id').primaryKey(),
  district: text('district').notNull(),
  districtSlug: text('district_slug').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  active: boolean('active').notNull().default(true),
  sort: integer('sort').notNull().default(0),
})

export type VerificationChecklist = {
  kimlik?: boolean
  adres?: boolean
  referans?: boolean
  deneme_isi?: boolean
}

export const providerProfiles = pgTable('provider_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').unique(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  avatarPathname: text('avatar_pathname'),
  verificationStatus: text('verification_status').notNull().default('pending'),
  verificationChecklist: jsonb('verification_checklist')
    .$type<VerificationChecklist>()
    .notNull()
    .default({}),
  isVerified: boolean('is_verified').notNull().default(false),
  ratingAvg: numeric('rating_avg', { precision: 3, scale: 2 }).notNull().default('0'),
  ratingCount: integer('rating_count').notNull().default(0),
  jobsCompleted: integer('jobs_completed').notNull().default(0),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const providerServices = pgTable(
  'provider_services',
  {
    providerId: text('provider_id').notNull(),
    moduleSlug: text('module_slug').notNull(),
    categorySlug: text('category_slug').notNull(),
    priceMin: integer('price_min'),
    priceMax: integer('price_max'),
  },
  (t) => [primaryKey({ columns: [t.providerId, t.moduleSlug, t.categorySlug] })],
)

export const providerRegions = pgTable(
  'provider_regions',
  {
    providerId: text('provider_id').notNull(),
    regionId: integer('region_id').notNull(),
  },
  (t) => [primaryKey({ columns: [t.providerId, t.regionId] })],
)

export type RequestStatus = 'open' | 'matched' | 'completed' | 'cancelled'

export const requests = pgTable('requests', {
  id: text('id').primaryKey(),
  publicToken: text('public_token').notNull().unique(),
  customerId: text('customer_id'),
  contactName: text('contact_name').notNull(),
  contactPhone: text('contact_phone').notNull(),
  moduleSlug: text('module_slug').notNull(),
  categorySlug: text('category_slug').notNull(),
  packageSlug: text('package_slug'),
  regionId: integer('region_id').notNull(),
  description: text('description'),
  details: jsonb('details').$type<Record<string, string | number | boolean>>().notNull().default({}),
  preferredDate: date('preferred_date'),
  preferredTime: text('preferred_time'),
  recurring: text('recurring').notNull().default('none'),
  status: text('status').$type<RequestStatus>().notNull().default('open'),
  acceptedOfferId: text('accepted_offer_id'),
  isDemo: boolean('is_demo').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const requestPhotos = pgTable('request_photos', {
  id: serial('id').primaryKey(),
  requestId: text('request_id').notNull(),
  pathname: text('pathname').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export const offers = pgTable('offers', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull(),
  providerId: text('provider_id').notNull(),
  price: integer('price').notNull(),
  message: text('message'),
  status: text('status').$type<OfferStatus>().notNull().default('pending'),
  source: text('source').notNull().default('provider'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  requestId: text('request_id').notNull(),
  /** Each customer–provider conversation is its own thread. */
  providerId: text('provider_id'),
  senderType: text('sender_type').$type<'customer' | 'provider' | 'admin'>().notNull(),
  senderId: text('sender_id'),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull().unique(),
  providerId: text('provider_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  status: text('status').$type<'published' | 'hidden'>().notNull().default('published'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  href: text('href'),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const waitlist = pgTable('waitlist', {
  id: serial('id').primaryKey(),
  moduleSlug: text('module_slug').notNull(),
  contact: text('contact').notNull(),
  regionId: integer('region_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const consents = pgTable('consents', {
  id: serial('id').primaryKey(),
  subjectType: text('subject_type').notNull(),
  subjectId: text('subject_id').notNull(),
  type: text('type').notNull(),
  version: text('version').notNull(),
  granted: boolean('granted').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------- Booking flow (ready for the berber-kuafor module) ----------

export const bookingServices = pgTable('booking_services', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull(),
  moduleSlug: text('module_slug').notNull(),
  name: text('name').notNull(),
  durationMin: integer('duration_min').notNull(),
  price: integer('price').notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const availabilityRules = pgTable('availability_rules', {
  id: serial('id').primaryKey(),
  providerId: text('provider_id').notNull(),
  weekday: integer('weekday').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
})

export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull(),
  serviceId: text('service_id').notNull(),
  customerId: text('customer_id'),
  contactName: text('contact_name').notNull(),
  contactPhone: text('contact_phone').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  status: text('status').notNull().default('confirmed'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
