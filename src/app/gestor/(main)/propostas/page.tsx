import SectionHeader from '@/components/SectionHeader';
import PropostaCard from '@/components/PropostaCard';
import { PropostaComColecao } from '@/types';

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

async function fetchPropostas(): Promise<PropostaComColecao[]> {
  const res = await fetch(`${BASE}/api/propostas`, { cache: 'no-store' });
  return res.json();
}

export default async function GestorPropostasPage() {
  const propostas = await fetchPropostas();

  const agendadas = propostas.filter((p) => p.status === 'agendada');
  const ativas = propostas.filter((p) => p.status === 'ativa');
  const encerradas = propostas.filter((p) => p.status === 'encerrada');

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-800)' }}>
      <h1 style={{ margin: 0, fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>Propostas</h1>

      {ativas.length > 0 && (
        <section>
          <SectionHeader title="Ativas" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-400)' }}>
            {ativas.map((p) => <PropostaCard key={p.id} proposta={p} colecao={p.colecao} />)}
          </div>
        </section>
      )}

      {agendadas.length > 0 && (
        <section>
          <SectionHeader title="Agendadas" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-400)' }}>
            {agendadas.map((p) => <PropostaCard key={p.id} proposta={p} colecao={p.colecao} />)}
          </div>
        </section>
      )}

      {encerradas.length > 0 && (
        <section>
          <SectionHeader title="Encerradas" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-400)' }}>
            {encerradas.map((p) => <PropostaCard key={p.id} proposta={p} colecao={p.colecao} />)}
          </div>
        </section>
      )}
    </div>
  );
}
