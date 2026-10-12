import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Çerez politikası' }

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Çerez politikası"
      intro="Buyur yalnızca sitenin çalışması için zorunlu olan çerezleri kullanır. Bu çerezler için izin gerekmez; reklam veya takip çerezi kullanmayız."
      sections={[
        {
          title: 'Kullandığımız çerezler',
          body: [
            [
              'Oturum çerezi: giriş yaptığında hesabını tanımak için. Çıkış yapınca ya da 7 gün sonra silinir.',
              'Bildirim tercihi: çerez bildirimini kapattığını hatırlamak için. 1 yıl saklanır.',
            ],
          ],
        },
        {
          title: 'Ölçümleme',
          body: [
            'Ziyaret istatistikleri çerez kullanmayan, kişiyi tanımlamayan bir analiz aracıyla toplanır.',
          ],
        },
        {
          title: 'Çerezleri nasıl silerim?',
          body: ['Tarayıcının ayarlarından çerezleri istediğin zaman silebilirsin. Oturum çerezini silersen yeniden giriş yapman gerekir.'],
        },
      ]}
    />
  )
}
