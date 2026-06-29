import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Ömer Faruk Yıldız — Backend Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Paylaşım/önizleme kartı — site temasıyla uyumlu (logo + isim).
export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public/logo.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 35%, #15151c, #0b0b0f)',
          color: '#ffffff', fontFamily: 'sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={190} height={190} alt="" style={{ borderRadius: 95, border: '2px solid #2a2a35' }} />
        <div style={{ fontSize: 66, fontWeight: 700, marginTop: 44, letterSpacing: -1 }}>Ömer Faruk Yıldız</div>
        <div style={{ fontSize: 32, color: '#0A84FF', marginTop: 14, fontWeight: 600 }}>Backend Developer · Otomasyon</div>
        <div style={{ fontSize: 24, color: '#8a8a99', marginTop: 10 }}>omerfarukyildiz.tech</div>
      </div>
    ),
    { ...size },
  );
}
