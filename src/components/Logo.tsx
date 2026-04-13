'use client';

import { useMarca } from '@/contexts/MarcaContext';

interface LogoProps {
  /**
   * Escala relativa ao tamanho nativo do SVG.
   * 1 = dimensões nativas (SAS: 73×32, COC: 114×32).
   * 0.75 = 75% das dimensões nativas (útil no header da Sidebar).
   * Padrão: 1.
   */
  scale?: number;
}

export function Logo({ scale = 1 }: LogoProps) {
  const { logoSrc, nomeExibicao, logoWidth, logoHeight } = useMarca();

  const w = Math.round(logoWidth * scale);
  const h = Math.round(logoHeight * scale);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoSrc}
      alt={`Logo ${nomeExibicao}`}
      width={w}
      height={h}
      style={{ width: w, height: h, display: 'block', objectFit: 'contain' }}
    />
  );
}
