import { ImageResponse } from 'next/og'
import { tr } from '@/lib/i18n/tr'

export const alt = `${tr.site.name}: ${tr.site.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 36,
        padding: 80,
        background: '#f7f9fc',
        color: '#1b2236',
      }}
    >
      <div style={{ display: 'flex', background: '#2546b8', padding: 12, borderRadius: 28 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '5px solid #f7f9fc',
            borderRadius: 20,
            padding: '24px 56px',
            color: '#f7f9fc',
          }}
        >
          <div style={{ fontSize: 26, letterSpacing: 6, fontWeight: 600 }}>BAYRAMPAŞA · ESENLER</div>
          <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: -4, lineHeight: 1.05 }}>
            Ne lazım? Buyur.
          </div>
        </div>
      </div>
      <div style={{ fontSize: 40, maxWidth: 940, lineHeight: 1.3, color: '#3b4566' }}>
        Mahallendeki onaylı ekiplerden dakikalar içinde fiyat teklifi al.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30 }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: '#e8a33a' }} />
        Üyelik yok · Uygulama indirme yok
      </div>
    </div>,
    size,
  )
}
