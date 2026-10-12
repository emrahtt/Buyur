import type { DetailField, ModuleDefinition } from './types'

const homeSize: DetailField = {
  type: 'select',
  name: 'oda',
  label: 'Ev büyüklüğü',
  required: true,
  options: [
    { value: '1+0', label: '1+0 / Stüdyo' },
    { value: '1+1', label: '1+1' },
    { value: '2+1', label: '2+1' },
    { value: '3+1', label: '3+1' },
    { value: '4+1', label: '4+1 ve üzeri' },
  ],
}

const bathrooms: DetailField = {
  type: 'number',
  name: 'banyo',
  label: 'Banyo / WC sayısı',
  min: 1,
  max: 5,
  required: true,
}

const supplies: DetailField = {
  type: 'toggle',
  name: 'malzeme',
  label: 'Temizlik malzemesini ekip getirsin',
  hint: 'Kapalıysa malzeme sizden',
}

const pets: DetailField = {
  type: 'toggle',
  name: 'evcil',
  label: 'Evde evcil hayvan var',
}

export const temizlik: ModuleDefinition = {
  slug: 'temizlik',
  name: 'Temizlik',
  tagline: 'Evin, ofisin, taşınacağın yer: pırıl pırıl.',
  description:
    'Mahallendeki onaylı temizlik ekiplerinden dakikalar içinde fiyat teklifi al. Sabit fiyat bantları, gerçek yorumlar, sürpriz yok.',
  flow: 'quote',
  status: 'active',
  icon: 'sparkles',
  providerNoun: 'temizlik ekibi',
  requestNoun: 'temizlik talebi',
  categories: [
    {
      slug: 'ev-temizligi',
      name: 'Ev temizliği',
      short: 'Haftalık ya da tek seferlik genel temizlik',
      description:
        'Toz alma, süpürme, silme, mutfak ve banyo temizliği. Düzenli temizlikte aynı ekip gelir.',
      icon: 'home',
      fields: [homeSize, bathrooms, supplies, pets],
      packages: [
        {
          slug: 'standart',
          name: 'Standart',
          description: '1+1 / 2+1 daire, genel temizlik',
          priceMin: 2200,
          priceMax: 3200,
          includes: ['Tüm odalar toz ve zemin', 'Mutfak tezgah ve ocak', 'Banyo ve WC'],
          popular: true,
        },
        {
          slug: 'genis',
          name: 'Geniş ev',
          description: '3+1 ve üzeri, genel temizlik',
          priceMin: 3200,
          priceMax: 4800,
          includes: ['Standart paketin tamamı', 'Balkon', 'Cam içleri'],
        },
      ],
    },
    {
      slug: 'derin-temizlik',
      name: 'Detaylı temizlik',
      short: 'Dolap içleri, fayans araları, kireç',
      description:
        'Bayram öncesi, misafir öncesi ya da uzun aradan sonra köşe bucak temizlik. Dolap içi, fayans arası, kireç sökme dahil.',
      icon: 'sparkles',
      fields: [homeSize, bathrooms, supplies, pets],
      packages: [
        {
          slug: 'detayli',
          name: 'Detaylı',
          description: 'Köşe bucak, dolap içleri dahil',
          priceMin: 4000,
          priceMax: 7000,
          includes: ['Dolap içleri', 'Fayans arası ve kireç', 'Cam iç-dış', 'Beyaz eşya dışları'],
          popular: true,
        },
      ],
    },
    {
      slug: 'tasinma-temizligi',
      name: 'Taşınma temizliği',
      short: 'Boş evde giriş ya da çıkış temizliği',
      description:
        'Taşınmadan önce ya da evi teslim etmeden önce boş evin baştan sona temizliği.',
      icon: 'truck',
      fields: [homeSize, bathrooms, supplies],
      packages: [
        {
          slug: 'bos-ev',
          name: 'Boş ev',
          description: 'Eşyasız daire, komple temizlik',
          priceMin: 3800,
          priceMax: 6800,
          includes: ['Tüm yüzeyler', 'Dolap ve çekmece içleri', 'Cam ve pervazlar'],
          popular: true,
        },
      ],
    },
    {
      slug: 'insaat-sonrasi',
      name: 'İnşaat sonrası',
      short: 'Tadilat tozu, boya ve harç kalıntısı',
      description:
        'Tadilat ya da inşaat sonrası ince toz, boya lekesi ve harç kalıntılarının profesyonel temizliği.',
      icon: 'hard-hat',
      fields: [
        homeSize,
        bathrooms,
        {
          type: 'select',
          name: 'kapsam',
          label: 'Tadilat kapsamı',
          required: true,
          options: [
            { value: 'kismi', label: 'Kısmi (mutfak / banyo)' },
            { value: 'komple', label: 'Komple daire' },
          ],
        },
      ],
      packages: [
        {
          slug: 'insaat',
          name: 'İnşaat sonrası',
          description: 'Toz, boya, harç temizliği',
          priceMin: 5000,
          priceMax: 9500,
          includes: ['İnce toz alma', 'Boya ve silikon lekesi', 'Cam ve doğrama'],
        },
      ],
    },
    {
      slug: 'ofis-temizligi',
      name: 'Ofis ve dükkan',
      short: 'Ofis, mağaza, atölye; mesai dışı da olur',
      description:
        'Ofis, mağaza ve atölyeler için tek seferlik ya da düzenli temizlik. Mesai dışı saatlerde çalışan ekipler var.',
      icon: 'building',
      fields: [
        {
          type: 'select',
          name: 'alan',
          label: 'Yaklaşık alan',
          required: true,
          options: [
            { value: '0-50', label: '50 m² altı' },
            { value: '50-150', label: '50–150 m²' },
            { value: '150-300', label: '150–300 m²' },
            { value: '300+', label: '300 m² üzeri' },
          ],
        },
        supplies,
        { type: 'toggle', name: 'mesai_disi', label: 'Mesai dışı saatlerde olsun' },
      ],
      packages: [
        {
          slug: 'ofis',
          name: 'Ofis',
          description: '150 m²’ye kadar genel temizlik',
          priceMin: 2500,
          priceMax: 6000,
          includes: ['Masa ve yüzeyler', 'Mutfak ve WC', 'Zemin'],
        },
      ],
    },
    {
      slug: 'koltuk-yikama',
      name: 'Koltuk ve halı',
      short: 'Yerinde koltuk, yatak, sandalye yıkama',
      description: 'Koltuk takımı, yatak ve sandalyelerin yerinde makineli yıkanması.',
      icon: 'sofa',
      fields: [
        {
          type: 'select',
          name: 'esya',
          label: 'Ne yıkanacak?',
          required: true,
          options: [
            { value: 'koltuk-takimi', label: 'Koltuk takımı (3+3+1)' },
            { value: 'kose', label: 'Köşe koltuk' },
            { value: 'yatak', label: 'Yatak' },
            { value: 'sandalye', label: 'Sandalyeler' },
          ],
        },
      ],
      packages: [
        {
          slug: 'koltuk',
          name: 'Koltuk takımı',
          description: 'Yerinde makineli yıkama',
          priceMin: 1200,
          priceMax: 2600,
          includes: ['Leke ön işlemi', 'Makineli yıkama', 'Hızlı kuruma'],
        },
      ],
    },
  ],
  faq: [
    {
      q: 'Fiyatlar neden aralık olarak yazıyor?',
      a: 'Her evin büyüklüğü ve durumu farklı. Buyur Paket aralıkları mahallendeki gerçek tekliflerden çıkar; ekipler bu aralığın dışına çıkacaksa nedenini teklifte açıklamak zorunda.',
    },
    {
      q: 'Üye olmam gerekiyor mu?',
      a: 'Hayır. Talebini oluştur, sana özel takip linkiyle teklifleri gör. İstersen sonra hesap açıp geçmişini saklarsın.',
    },
    {
      q: '"Buyur Onaylı" ne demek?',
      a: 'Kimliği, adresi ve referansları kontrol edilmiş, ekibimizin gözetiminde deneme işi yapmış hizmet verenler bu rozeti alır.',
    },
    {
      q: 'Ödemeyi kime yapıyorum?',
      a: 'Şimdilik ödemeyi iş bitince doğrudan ekibe yapıyorsun. Kabul ettiğin teklif tutarı kayıt altında kalır.',
    },
  ],
}
