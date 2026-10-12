import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'KVKK Aydınlatma Metni' }

export default function KvkkPage() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      intro="Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 10. maddesi uyarınca, Buyur’u kullanırken kişisel verilerinin nasıl işlendiğini anlatır. Aydınlatma metni bir onay metni değildir; açık rızanın gerektiği durumlarda ayrıca ve ayrı bir onay kutusuyla izin istenir."
      sections={[
        {
          title: 'Veri sorumlusu',
          body: ['Kişisel verilerin, veri sorumlusu sıfatıyla Buyur platformunu işleten tarafından işlenir.'],
        },
        {
          title: 'Hangi verileri işliyoruz?',
          body: [
            [
              'Kimlik ve iletişim: ad soyad, cep telefonu, e-posta (hesap açarsan)',
              'Talep bilgileri: hizmet türü, mahalle, tarih, ev büyüklüğü gibi detaylar, açıklama ve yüklediğin fotoğraflar',
              'İşlem kayıtları: teklifler, mesajlar, yorumlar ve onay kayıtları',
              'Hizmet verenler için ek olarak: işletme adı, hizmet bölgeleri ve doğrulama kontrol sonuçları',
            ],
          ],
        },
        {
          title: 'Hangi amaçla ve hangi hukuki sebeple?',
          body: [
            'Talebini bölgendeki hizmet verenlere iletmek, teklifleri sana göstermek ve seçtiğin ekiple iletişimini sağlamak için verilerin, bir sözleşmenin kurulması ve ifası için gerekli olması (KVKK m.5/2-c) hukuki sebebine dayanılarak işlenir.',
            'Kötüye kullanımı önlemek, güvenliği sağlamak ve yasal yükümlülükleri yerine getirmek için meşru menfaat (m.5/2-f) ve hukuki yükümlülük (m.5/2-ç) sebeplerine dayanılır.',
            'Kampanya ve duyuru iletileri yalnızca ayrıca verdiğin açık rızaya dayanılarak gönderilir; bu izni vermesen de hizmeti kullanabilirsin.',
          ],
        },
        {
          title: 'Verilerin kimlere aktarılır?',
          body: [
            'Talebin, yalnızca talep ettiğin hizmeti verdiğini ve mahallene gittiğini belirten onaylı hizmet verenlere gösterilir. Telefon numaran, yalnızca teklifini kabul ettiğin hizmet verenle paylaşılır.',
            'Barındırma ve veritabanı hizmetleri için yurt dışında sunucu bulunduran hizmet sağlayıcılar kullanılabilir. Bu aktarımlar KVKK m.9’da öngörülen güvencelere uygun olarak yapılır.',
          ],
        },
        {
          title: 'Ne kadar süre saklıyoruz?',
          body: [
            'Talep ve işlem kayıtları, ilgili mevzuatta öngörülen süreler ve olası uyuşmazlıklar için gerekli süre boyunca saklanır; süre dolunca silinir, yok edilir veya anonim hale getirilir.',
          ],
        },
        {
          title: 'Hakların',
          body: [
            'KVKK m.11 uyarınca verilerinin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme, aktarıldığı kişileri bilme, itiraz etme ve zarara uğradıysan tazminat talep etme hakların vardır. Taleplerini platform üzerindeki iletişim kanallarından iletebilirsin; en geç 30 gün içinde yanıtlanır.',
          ],
        },
      ]}
    />
  )
}
