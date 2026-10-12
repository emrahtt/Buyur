import { ImageResponse } from 'next/og'

const COBALT = '#2546b8'
const PORCELAIN = '#f7f9fc'

/** Square app icon: the enamel street plate reduced to a "B". */
export function brandIcon(size: number, { maskable = false } = {}) {
  const inset = maskable ? size * 0.2 : size * 0.06
  const frame = Math.max(2, Math.round(size * 0.035))
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: COBALT,
        padding: inset,
        borderRadius: maskable ? 0 : size * 0.22,
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `${frame}px solid ${PORCELAIN}`,
          borderRadius: size * 0.16,
          color: PORCELAIN,
          fontSize: size * (maskable ? 0.42 : 0.58),
          fontWeight: 800,
          letterSpacing: -size * 0.02,
          lineHeight: 1,
        }}
      >
        B
      </div>
    </div>,
    { width: size, height: size },
  )
}
