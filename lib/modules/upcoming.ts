import type { ModuleDefinition } from './types'

export const berberKuafor: ModuleDefinition = {
  slug: 'berber-kuafor',
  name: 'Berber & Kuaför',
  tagline: 'Sıra bekleme, saatini seç gel.',
  description:
    'Mahallendeki berber ve kuaförlerden boş saatleri gör, tek dokunuşla randevunu al.',
  flow: 'booking',
  status: 'coming_soon',
  icon: 'scissors',
  providerNoun: 'salon',
  requestNoun: 'randevu',
  categories: [
    {
      slug: 'sac-kesimi',
      name: 'Saç kesimi',
      short: 'Erkek, kadın, çocuk',
      description: 'Saç kesimi ve şekillendirme randevusu.',
      icon: 'scissors',
      fields: [],
      packages: [],
    },
    {
      slug: 'sakal-tiras',
      name: 'Sakal tıraşı',
      short: 'Ustura, şekillendirme',
      description: 'Sakal tıraşı ve bakım randevusu.',
      icon: 'scissors',
      fields: [],
      packages: [],
    },
  ],
  faq: [],
}

export const tadilat: ModuleDefinition = {
  slug: 'tadilat',
  name: 'Tadilat & Boya',
  tagline: 'Boyadan fayansa, ustası mahallende.',
  description: 'Boya, badana, fayans ve küçük tadilat işleri için yakınındaki ustalardan teklif al.',
  flow: 'quote',
  status: 'coming_soon',
  icon: 'paint',
  providerNoun: 'usta',
  requestNoun: 'tadilat talebi',
  categories: [
    {
      slug: 'boya-badana',
      name: 'Boya badana',
      short: 'Oda, daire, dış cephe',
      description: 'İç ve dış boya badana işleri.',
      icon: 'paint',
      fields: [],
      packages: [],
    },
  ],
  faq: [],
}

export const nakliye: ModuleDefinition = {
  slug: 'nakliye',
  name: 'Evden Eve Nakliye',
  tagline: 'Eşyan kırılmadan yeni evinde.',
  description: 'Asansörlü, sigortalı nakliyecilerden aynı gün teklif al.',
  flow: 'quote',
  status: 'coming_soon',
  icon: 'package',
  providerNoun: 'nakliyeci',
  requestNoun: 'nakliye talebi',
  categories: [
    {
      slug: 'evden-eve',
      name: 'Evden eve',
      short: 'Paketleme dahil taşıma',
      description: 'Evden eve nakliye ve paketleme.',
      icon: 'package',
      fields: [],
      packages: [],
    },
  ],
  faq: [],
}

export const tamirBakim: ModuleDefinition = {
  slug: 'tamir-bakim',
  name: 'Tamir & Bakım',
  tagline: 'Musluk damlıyor, priz yanmıyor? Buyur.',
  description: 'Elektrik, tesisat ve kombi bakımı için yakınındaki ustalar.',
  flow: 'quote',
  status: 'coming_soon',
  icon: 'wrench',
  providerNoun: 'usta',
  requestNoun: 'tamir talebi',
  categories: [
    {
      slug: 'elektrik',
      name: 'Elektrik',
      short: 'Priz, aydınlatma, sigorta',
      description: 'Elektrik arıza ve montaj işleri.',
      icon: 'zap',
      fields: [],
      packages: [],
    },
    {
      slug: 'tesisat',
      name: 'Su tesisatı',
      short: 'Musluk, kaçak, tıkanıklık',
      description: 'Su tesisatı arıza ve montaj işleri.',
      icon: 'droplets',
      fields: [],
      packages: [],
    },
  ],
  faq: [],
}
