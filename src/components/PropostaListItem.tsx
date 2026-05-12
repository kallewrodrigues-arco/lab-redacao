'use client';

import Link from 'next/link';
import { Proposta, Colecao } from '@/types';
import { useMarca } from '@/contexts/MarcaContext';

interface PropostaListItemProps {
  proposta: Proposta;
  colecao?: Colecao | null;
  subtitle: string;
  href: string;
}

const Chevron = () => (
  <div
    style={{
      background: 'transparent',
      borderRadius: 8,
      minHeight: 44,
      minWidth: 44,
      padding: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      color: 'var(--text-caption)',
    }}
    aria-hidden="true"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7.5 5l5 5-5 5"/>
    </svg>
  </div>
);

export default function PropostaListItem({ proposta, colecao, subtitle, href }: PropostaListItemProps) {
  const marcaConfig = useMarca();
  const imageUrl = colecao?.nome.startsWith('Livro I')
    ? marcaConfig.imagemColecaoLivro
    : marcaConfig.imagemColecaoPratique;

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 8,
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-secondary)',
          borderRadius: 8,
          color: 'inherit',
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--text-body)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.5,
            }}
          >
            {proposta.titulo}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--text-caption)',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {subtitle}
          </p>
        </div>
        <Chevron />
      </div>
    </Link>
  );
}
