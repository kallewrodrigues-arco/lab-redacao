'use client';

import Link from 'next/link';
import { Proposta, Colecao } from '@/types';
import { useMarca } from '@/contexts/MarcaContext';

function resolveColecaoNome(nome: string, nomeColecaoPratique: string): string {
  const BASE = 'Pratique Redação'
  return nome.startsWith(BASE) ? nomeColecaoPratique + nome.slice(BASE.length) : nome
}

interface PropostaCardProps {
  proposta: Proposta;
  colecao: Colecao | null;
}

function formatVisibilityDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function PropostaCard({ proposta, colecao }: PropostaCardProps) {
  const marcaConfig = useMarca()
  const todayStr = new Date().toISOString().split('T')[0];
  const isOculto = proposta.dataAgendada > todayStr;
  const dotColor = isOculto ? 'var(--color-info-text, #0f5384)' : 'var(--color-success-text, #0c7742)';
  const statusColor = isOculto ? 'var(--color-info-text, #0f5384)' : 'var(--color-success-text, #0c7742)';
  const statusText = isOculto
    ? `Oculto até ${formatVisibilityDate(proposta.dataAgendada)}`
    : `Visível em ${formatVisibilityDate(proposta.dataAgendada)}`;

  return (
    <Link
      href={`/professor/propostas/${proposta.id}`}
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--radius-lg, 16px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 0 0',
        minWidth: 200,
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
      }}
    >
      <div style={{ height: 80, overflow: 'hidden', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={colecao?.nome.startsWith('Livro I') ? marcaConfig.imagemColecaoLivro : marcaConfig.imagemColecaoPratique}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div style={{ padding: '24px 24px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {colecao && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 9999,
                background: colecao.cor + '33',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, color: colecao.cor }}>
                {resolveColecaoNome(colecao.nome, marcaConfig.nomeColecaoPratique).charAt(0)}
              </span>
            </div>
            <span
              style={{
                fontSize: 14,
                color: colecao.cor,
                letterSpacing: '0.2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {resolveColecaoNome(colecao.nome, marcaConfig.nomeColecaoPratique)}
            </span>
          </div>
        )}
        <p
          style={{
            margin: 0,
            fontSize: 16,
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
      </div>

      <div
        style={{
          padding: '8px 24px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 9999,
              background: dotColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: statusColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {statusText}
          </span>
        </div>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 8,
            minHeight: 44,
            minWidth: 44,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            color: 'var(--text-caption)',
          }}
          aria-label="Mais opções"
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(115,127,186,0.14)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          onMouseDown={e => (e.currentTarget.style.background = 'rgba(92,103,161,0.26)')}
          onMouseUp={e => (e.currentTarget.style.background = 'rgba(115,127,186,0.14)')}
          onClick={e => e.preventDefault()}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M5 10h.01M10 10h.01M15 10h.01"/>
          </svg>
        </button>
      </div>
    </Link>
  );
}
