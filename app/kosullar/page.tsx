import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Kullanım koşulları' }

export default function TermsPage() {
  return (
    <LegalPage
      title="Kullanım koşulları"
      intro="Buyur, mahalledeki hizmet alanlarla hizmet verenleri buluşturan bir aracı platformdur. Hizmetin kendisini Buyur değil, seçtiğin hizmet veren sunar."
      sections={[
        {
          title: 'Müşteriler için',
          body: [
            [
              'Talebinde doğru ve güncel bilgi verirsin.',
              'Kabul ettiğin teklifteki tutar, iş bitiminde doğrudan hizmet verene ödenir. Buyur şu an ödeme almaz.',
              'Yorumların gerçek deneyimine dayanmalıdır; hakaret, kişisel veri ve reklam içeren yorumlar yayından kaldırılabilir.',
            ],
          ],
        },
        {
          title: 'Hizmet verenler için',
          body: [
            [
              'Profilindeki bilgilerin doğruluğundan sen sorumlusun.',
              'Müşteri bilgilerini yalnızca ilgili iş için kullanır, üçüncü kişilerle paylaşmazsın.',
              'Buyur Paket bandının dışında teklif veriyorsan nedenini teklif notunda açıklarsın.',
              'Kabul ettiğin işe gelmemek, müşteriyle platform dışında farklı fiyat dayatmak gibi davranışlar profilin yayından kaldırılmasına yol açabilir.',
            ],
          ],
        },
        {
          title: 'Sorumluluk',
          body: [
            'Buyur, hizmet verenleri yayına almadan önce makul kontroller yapar; ancak hizmetin ifasından doğan uyuşmazlıklarda taraf değildir. Sorun yaşarsan bize bildir; ilgili hizmet vereni inceleyip gerekli önlemi alırız.',
          ],
        },
        {
          title: 'Değişiklikler',
          body: ['Bu koşullar güncellenebilir. Önemli değişikliklerde sürüm numarası değişir ve sana bildiririz.'],
        },
      ]}
    />
  )
}
