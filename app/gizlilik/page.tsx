import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Gizlilik' }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Gizlilik"
      intro="Buyur’un gizlilik yaklaşımı kısaca şu: işini görmek için gereken kadar veri, gereken kişiyle, gereken süre boyunca."
      sections={[
        {
          title: 'Neyi kim görür?',
          body: [
            [
              'Herkes: hizmet veren profilleri, onaylı rozetler ve yorumlar (yorum yapanın yalnızca adı ve soyadının baş harfi)',
              'Bölgendeki onaylı ekipler: talebinin detayları, mahallen, adının kısaltılmış hali ve fotoğrafların',
              'Teklifini kabul ettiğin ekip: adın ve telefon numaran',
              'Buyur ekibi: destek ve denetim için tüm talep kayıtları',
            ],
          ],
        },
        {
          title: 'Fotoğraflar',
          body: [
            'Yüklediğin fotoğraflar herkese açık bir adreste tutulmaz; yalnızca yetkili kişilere, her istekte yetki kontrolü yapılarak gösterilir.',
          ],
        },
        {
          title: 'Takip linki',
          body: [
            'Hesap açmadan oluşturduğun talepler, sana özel ve tahmin edilemeyen bir linkle açılır. Bu linki bilen herkes talebini görebilir; başkalarıyla paylaşmamanı öneririz. İstersen hesap açıp talebini hesabına ekleyebilirsin.',
          ],
        },
        {
          title: 'Ölçümleme',
          body: [
            'Sitenin nasıl kullanıldığını anlamak için çerez kullanmayan, kişiyi tanımlamayan toplu istatistikler topluyoruz. Reklam takibi yapmıyoruz.',
          ],
        },
      ]}
    />
  )
}
