'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { RedacaoComDetalhes, EvolucaoAluno } from '@/types';

const ALUNO_ID = 'aluno-1';
const ALUNO_NOME = 'Ana Carolina';

type Tab = 'semana' | 'atrasadas' | 'corrigidas';

const COMPETENCIAS = ['C1', 'C2', 'C3', 'C4', 'C5'];
const COMP_TITULOS: Record<string, string> = {
  C1: 'Escrita formal',
  C2: 'Compreender tema',
  C3: 'Organizar ideias',
  C4: 'Argumentação',
  C5: 'Propor solução',
};

export default function AlunoPage() {
  const [tab, setTab] = useState<Tab>('semana');
  const [redacoes, setRedacoes] = useState<RedacaoComDetalhes[]>([]);
  const [evolucao, setEvolucao] = useState<EvolucaoAluno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [redRes, evRes] = await Promise.all([
        fetch(`/api/redacoes?alunoId=${ALUNO_ID}`),
        fetch(`/api/alunos/${ALUNO_ID}/evolucao`),
      ]);
      const red = await redRes.json();
      const ev = await evRes.json();
      setRedacoes(red);
      setEvolucao(ev);
      setLoading(false);
    }
    load();
  }, []);

  const corrigidas = redacoes.filter((r) => r.status === 'corrigida');
  const pendentes = redacoes.filter((r) => r.status === 'pendente_envio' || r.status === 'enviada');
  const ultimaNota = evolucao?.historico?.slice(-1)[0]?.notaFinal;
  const ultimasCompetencias = evolucao?.historico?.slice(-1)[0]?.competencias ?? {};

  const getTabRedacoes = () => {
    if (tab === 'corrigidas') return corrigidas;
    if (tab === 'atrasadas') return redacoes.filter((r) => r.status === 'ilegivel' || r.status === 'rejeitada');
    return pendentes;
  };

  const tabRedacoes = getTabRedacoes();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-600)' }}>
      {/* Greeting */}
      <div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Olá, {ALUNO_NOME}</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--text-caption)', fontSize: '14px' }}>
          3ª série A
        </p>
      </div>

      {/* Última nota */}
      {ultimaNota !== undefined && (
        <div
          style={{
            background: 'var(--color-blue-light)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-500)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-400)',
          }}
        >
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--color-blue-dark)',
              lineHeight: 1,
            }}
          >
            {ultimaNota}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-blue-dark)' }}>
              Sua última nota
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-caption)' }}>de 1000 pontos possíveis</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid var(--border-secondary)',
        }}
      >
        {([
          { key: 'semana', label: 'Esta semana' },
          { key: 'atrasadas', label: 'Atrasadas' },
          { key: 'corrigidas', label: 'Corrigidas' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              padding: 'var(--space-300) var(--space-400)',
              fontSize: '13px',
              fontWeight: tab === t.key ? 600 : 400,
              color: tab === t.key ? 'var(--color-blue)' : 'var(--text-caption)',
              borderBottom: tab === t.key ? '2px solid var(--color-blue)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <p style={{ color: 'var(--text-caption)', textAlign: 'center' }}>Carregando...</p>
      ) : tabRedacoes.length === 0 ? (
        <p style={{ color: 'var(--text-caption)', fontSize: '14px', textAlign: 'center', padding: 'var(--space-600)' }}>
          Nenhuma redação nesta categoria.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-300)' }}>
          {tabRedacoes.map((r) => (
            <Link
              key={r.id}
              href={`/aluno/redacoes/${r.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-300)',
                padding: 'var(--space-400)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {r.proposta?.imageUrl && (
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.proposta.imageUrl}
                    alt={r.proposta.titulo}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.proposta?.titulo ?? 'Proposta'}
                </p>
                {r.dataEnvio && (
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-caption)', marginTop: 2 }}>
                    Enviada em {new Date(r.dataEnvio).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      )}

      {/* Progresso por competência */}
      {evolucao && evolucao.historico.length > 0 && (
        <section>
          <h3 style={{ margin: '0 0 var(--space-400)', fontSize: '15px', fontWeight: 600 }}>
            Acompanhe seu progresso
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-300)' }}>
            {COMPETENCIAS.map((cod) => {
              const nota = ultimasCompetencias[cod] ?? 0;
              const pct = (nota / 200) * 100;
              return (
                <div key={cod}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>
                      {cod} — {COMP_TITULOS[cod]}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-caption)' }}>{nota}/200</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: 'var(--border-secondary)',
                      borderRadius: 'var(--radius-pill)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background:
                          nota >= 160
                            ? 'var(--color-green)'
                            : nota >= 100
                            ? 'var(--color-blue)'
                            : 'var(--color-orange)',
                        borderRadius: 'var(--radius-pill)',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
