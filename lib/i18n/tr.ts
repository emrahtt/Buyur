import type { OfferStatus, RequestStatus } from '@/lib/db/schema'

export const tr = {
  site: {
    name: 'Buyur',
    tagline: 'Ne lazım? Buyur.',
    description:
      'Bayrampaşa ve Esenler’de mahallendeki onaylı temizlik ekiplerinden dakikalar içinde fiyat teklifi al. Üyelik yok, uygulama indirme yok.',
    region: 'Bayrampaşa · Esenler',
  },
  nav: {
    services: 'Hizmetler',
    newRequest: 'Talep aç',
    becomeProvider: 'Hizmet ver',
    signIn: 'Giriş yap',
    signUp: 'Hesap aç',
    panel: 'Taleplerim',
    providerPanel: 'Veren paneli',
    admin: 'Yönetim',
    signOut: 'Çıkış yap',
  },
  requestStatus: {
    open: 'Teklif bekleniyor',
    matched: 'Ekip belli oldu',
    completed: 'Tamamlandı',
    cancelled: 'İptal edildi',
  } satisfies Record<RequestStatus, string>,
  offerStatus: {
    pending: 'Bekliyor',
    accepted: 'Kabul edildi',
    rejected: 'Seçilmedi',
    withdrawn: 'Geri çekildi',
  } satisfies Record<OfferStatus, string>,
  verification: {
    pending: 'Onay bekliyor',
    approved: 'Yayında',
    rejected: 'Reddedildi',
  } as Record<string, string>,
  checklist: {
    kimlik: 'Kimlik kontrolü',
    adres: 'Adres teyidi',
    referans: 'Referans görüşmesi',
    deneme_isi: 'Gözetimli deneme işi',
  },
  errors: {
    generic: 'Bir şeyler ters gitti. Lütfen tekrar dene.',
    auth: 'E-posta ya da şifre hatalı.',
    signUp: 'Hesap oluşturulamadı. Bilgileri kontrol edip tekrar dene.',
    rateLimit: 'Kısa sürede çok fazla talep gönderildi. Biraz sonra tekrar dene.',
  },
} as const

export const CONSENT_VERSION = '2026-10'
