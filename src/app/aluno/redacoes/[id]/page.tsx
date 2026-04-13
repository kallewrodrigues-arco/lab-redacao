'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { RedacaoComDetalhes, Devolutiva } from '@/types';

export default function AlunoRedacaoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [redacao, setRedacao] = useState<RedacaoComDetalhes | null>(null);
  const [devolutiva, setDevolutiva] = useState<Devolutiva | null>(null);
  const [loading, setLoading] = useState(true);
  const [duvida, setDuvida] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [duvidaEnviada, setDuvidaEnviada] = useState(false);

  useEffect(() => {
    async function load() {
      const redacoesAll = await fetch('/api/redacoes?alunoId=aluno-1').then((r) => r.json());
      const r = redacoesAll.find((x: RedacaoComDetalhes) => x.id === id);
      setRedacao(r ?? null);

      if (r?.status === 'corrigida') {
        const devRes = await fetch(`/api/redacoes/${id}/devolutiva`);
        if (devRes.ok) {
          const d = await devRes.json();
          if (!d.error) setDevolutiva(d);
        }
      }

      setLoading(false);
    }
    load();
  }, [id]);

  async function handleEnviarDuvida() {
    if (!duvida.trim()) return;
    setEnviando(true);
    await fetch(`/api/redacoes/${id}/duvidas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alunoId: 'aluno-1', texto: duvida }),
    });
    setDuvidaEnviada(true);
    setDuvida('');
    setEnviando(false);
  }

  if (loading) return <div style={{ padding: 'var(--space-500)', color: 'var(--text-caption)' }}>Carregando...</div>;
  if (!redacao) return <div style={{ padding: 'var(--space-500)', color: 'var(--color-red)' }}>Redação não encontrada.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-600)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)' }}>
        <Link href="/aluno" style={{ color: 'var(--text-caption)', textDecoration: 'none', fontSize: '14px' }}>
          ← Início
        </Link>
        <StatusBadge status={redacao.status} />
      </div>

      <div>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
          {redacao.proposta?.titulo ?? 'Proposta'}
        </h1>
        {redacao.dataEnvio && (
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-caption)' }}>
            Enviada em {new Date(redacao.dataEnvio).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      {/* Status info */}
      {redacao.status !== 'corrigida' && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-500)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>
            {redacao.status === 'corrigindo' || redacao.status === 'aguardando_liberacao' ? '⏳' : '📄'}
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-caption)' }}>
            {redacao.status === 'corrigindo' && 'Sua redação está sendo corrigida pela IA...'}
            {redacao.status === 'aguardando_liberacao' && 'Aguardando validação do professor...'}
            {redacao.status === 'enviada' && 'Redação recebida! Em breve será corrigida.'}
            {redacao.status === 'pendente_envio' && 'Você ainda não enviou esta redação.'}
            {redacao.status === 'rejeitada' && 'Sua redação foi rejeitada. Entre em contato com o professor.'}
            {redacao.status === 'ilegivel' && 'Não foi possível ler sua redação. Por favor, reenvie.'}
          </p>
        </div>
      )}

      {/* Devolutiva */}
      {devolutiva && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-500)' }}>
          {/* Nota */}
          <div
            style={{
              background: 'var(--color-blue-light)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-600)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-500)',
            }}
          >
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-blue-dark)', lineHeight: 1 }}>
              {devolutiva.notaFinal}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-blue-dark)' }}>Nota final</div>
              <div style={{ fontSize: '12px', color: 'var(--text-caption)' }}>de 1000 pontos</div>
            </div>
          </div>

          {/* Comentário geral */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-500)' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 8 }}>Comentário geral</div>
            <p style={{ margin: 0, fontSize: '14px' }}>{devolutiva.comentarioGeral}</p>
          </div>

          {/* Competências */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: 'var(--space-300)' }}>Por competência</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-300)' }}>
              {devolutiva.competencias.map((comp) => (
                <div
                  key={comp.codigo}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-400)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>{comp.codigo}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-caption)', marginLeft: 8 }}>{comp.titulo}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{comp.nota}/200</span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: 'var(--border-secondary)',
                      borderRadius: 'var(--radius-pill)',
                      overflow: 'hidden',
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(comp.nota / 200) * 100}%`,
                        background: comp.nota >= 160 ? 'var(--color-green)' : comp.nota >= 100 ? 'var(--color-blue)' : 'var(--color-orange)',
                        borderRadius: 'var(--radius-pill)',
                      }}
                    />
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-caption)' }}>{comp.comentario}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Plano de ação */}
          {devolutiva.planoDeAcao && (
            <div
              style={{
                background: 'var(--color-green-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-500)',
                borderLeft: '3px solid var(--color-green)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-green)', marginBottom: 6 }}>
                Plano de ação
              </div>
              <p style={{ margin: 0, fontSize: '13px' }}>{devolutiva.planoDeAcao}</p>
            </div>
          )}

          {/* Dúvidas */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-500)' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 'var(--space-300)' }}>
              Enviar dúvida ao professor
            </div>
            {duvidaEnviada && (
              <p style={{ fontSize: '13px', color: 'var(--color-green)', margin: '0 0 8px' }}>
                ✓ Dúvida enviada!
              </p>
            )}
            <textarea
              value={duvida}
              onChange={(e) => setDuvida(e.target.value)}
              placeholder="Escreva sua dúvida..."
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--space-300)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                background: 'var(--bg-primary)',
                color: 'var(--text-body)',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={handleEnviarDuvida}
              disabled={enviando || !duvida.trim()}
              style={{
                marginTop: 'var(--space-300)',
                background: 'var(--color-blue)',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                opacity: enviando || !duvida.trim() ? 0.6 : 1,
              }}
            >
              {enviando ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
