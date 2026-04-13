import Link from 'next/link';
import EssayListItem from '@/components/EssayListItem';
import { RedacaoComDetalhes } from '@/types';

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

async function fetchRedacoes(): Promise<RedacaoComDetalhes[]> {
  const res = await fetch(`${BASE}/api/redacoes`, { cache: 'no-store' });
  return res.json();
}

const STATUS_LABELS: Record<string, string> = {
  atrasada: 'Atrasadas',
  pendente: 'Pendentes de correção',
  corrigida: 'Corrigidas',
  rejeitada: 'Rejeitadas',
};

function matchesFilter(redacao: RedacaoComDetalhes, status: string | undefined): boolean {
  if (!status) return true;
  switch (status) {
    case 'atrasada':
      return redacao.status === 'enviada';
    case 'pendente':
      return redacao.status === 'aguardando_liberacao';
    case 'corrigida':
      return redacao.status === 'corrigida';
    case 'rejeitada':
      return redacao.status === 'rejeitada';
    default:
      return true;
  }
}

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ProfessorRedacoesPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const redacoes = await fetchRedacoes();

  const filtered = redacoes.filter((r) => matchesFilter(r, status));
  const pageTitle = status ? STATUS_LABELS[status] ?? 'Redações' : 'Todas as redações';

  const groups = status
    ? null
    : {
        aguardando: redacoes.filter((r) => r.status === 'aguardando_liberacao'),
        corrigindo: redacoes.filter((r) => r.status === 'corrigindo'),
        corrigidas: redacoes.filter((r) => r.status === 'corrigida'),
        outras: redacoes.filter((r) => ['enviada', 'pendente_envio', 'rejeitada', 'ilegivel'].includes(r.status)),
      };

  return (
    <div style={{ padding: 'var(--space-700)', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link
          href="/professor"
          style={{ fontSize: 14, color: 'var(--text-caption)', textDecoration: 'none' }}
        >
          ← Início
        </Link>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: 'var(--text-body)' }}>
          {pageTitle}
        </h1>
      </div>

      {status ? (
        filtered.length === 0 ? (
          <p style={{ color: 'var(--text-caption)' }}>Nenhuma redação encontrada.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((r) => (
              <EssayListItem
                key={r.id}
                redacao={r}
                proposta={r.proposta}
                href={r.status === 'corrigida'
                  ? `/professor/propostas/${r.propostaId}?aba=resultados`
                  : `/professor/propostas/${r.propostaId}?aba=correcao`}
              />
            ))}
          </div>
        )
      ) : (
        <>
          {groups!.aguardando.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 600, color: 'var(--text-body)', letterSpacing: '-0.2px' }}>
                Aguardando validação
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groups!.aguardando.map((r) => (
                  <EssayListItem key={r.id} redacao={r} proposta={r.proposta} href={`/professor/propostas/${r.propostaId}?aba=correcao`} />
                ))}
              </div>
            </section>
          )}
          {groups!.corrigindo.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 600, color: 'var(--text-body)', letterSpacing: '-0.2px' }}>
                Corrigindo (IA)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groups!.corrigindo.map((r) => (
                  <EssayListItem key={r.id} redacao={r} proposta={r.proposta} href={`/professor/propostas/${r.propostaId}?aba=correcao`} />
                ))}
              </div>
            </section>
          )}
          {groups!.corrigidas.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 600, color: 'var(--text-body)', letterSpacing: '-0.2px' }}>
                Corrigidas
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groups!.corrigidas.map((r) => (
                  <EssayListItem key={r.id} redacao={r} proposta={r.proposta} href={`/professor/propostas/${r.propostaId}?aba=resultados`} />
                ))}
              </div>
            </section>
          )}
          {groups!.outras.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 600, color: 'var(--text-body)', letterSpacing: '-0.2px' }}>
                Outras
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groups!.outras.map((r) => (
                  <EssayListItem key={r.id} redacao={r} proposta={r.proposta} href={`/professor/propostas/${r.propostaId}?aba=correcao`} />
                ))}
              </div>
            </section>
          )}
          {redacoes.length === 0 && (
            <p style={{ color: 'var(--text-caption)' }}>Nenhuma redação encontrada.</p>
          )}
        </>
      )}
    </div>
  );
}
