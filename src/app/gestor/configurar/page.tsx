'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DefinicoesGerais } from '@/components/configurar/DefinicoesGerais';
import { TurmasFrequencia } from '@/components/configurar/TurmasFrequencia';
import { DrawerSelecaoTurmas } from '@/components/configurar/DrawerSelecaoTurmas';
import { LiberacaoAtividades, expandColecoesAtivas } from '@/components/configurar/LiberacaoAtividades';
import { LiberacaoDevolutiva } from '@/components/configurar/LiberacaoDevolutiva';

// ── Tipos do formulário central ───────────────────────────────────────────────

export interface TurmaConfig {
  id: string;
  nome: string;
  totalEstudantes: number;
  colecao: '' | 'material_didatico' | 'material_didatico_pratique';
  professorId: string;
}

export interface ConfigFormState {
  dataInicio: string;
  turmas: TurmaConfig[];
  liberacaoAtividades: Record<string, 'automatico' | 'manual'>;
  liberacaoDevolutiva: Record<string, 'automatico' | 'manual'>;
}

function isFormComplete(state: ConfigFormState): boolean {
  if (!state.dataInicio) return false;
  if (state.turmas.length === 0) return false;
  const allTurmasValid = state.turmas.every(
    (t) => t.colecao !== '' && t.professorId !== '',
  );
  if (!allTurmasValid) return false;
  // Coleções ativas expandidas (material_didatico_pratique → inclui material_didatico)
  const rawColecoes = [...new Set(state.turmas.map((t) => t.colecao).filter(Boolean))];
  const colecoesAtivas = expandColecoesAtivas(rawColecoes);
  const allAtividadesSet = colecoesAtivas.every((c) => state.liberacaoAtividades[c] !== undefined);
  const allDevolutivasSet = colecoesAtivas.every((c) => state.liberacaoDevolutiva[c] !== undefined);
  return allAtividadesSet && allDevolutivasSet;
}

// ── Ícones ────────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M12 5L7 10l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Componente principal ──────────────────────────────────────────────────────

export default function GestorConfigurarPage() {
  const [formState, setFormState] = useState<ConfigFormState>({
    dataInicio: '',
    turmas: [],
    liberacaoAtividades: {},
    liberacaoDevolutiva: {},
  });
  const [savedDataInicio, setSavedDataInicio] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const canSave = isFormComplete(formState);

  // Carrega configuração existente ao montar
  useEffect(() => {
    fetch('/api/configuracao')
      .then((r) => r.json())
      .then((data) => {
        const dataInicio = Array.isArray(data) ? data[0]?.dataInicio ?? '' : data?.dataInicio ?? '';
        if (dataInicio) {
          setSavedDataInicio(dataInicio);
          setFormState((prev) => ({ ...prev, dataInicio }));
        }
      })
      .catch(() => {});
  }, []);

  /**
   * Recebe os IDs confirmados pelo drawer e reconcilia com o estado atual:
   * - Turmas já configuradas (com colecao/professorId) são preservadas se ainda selecionadas.
   * - Novas turmas entram com colecao='' e professorId=''.
   * - Turmas removidas são descartadas.
   */
  async function handleConfirmDrawer(turmaIds: string[]) {
    // Busca turmas enriquecidas (nome + totalEstudantes)
    const resp = await fetch('/api/turmas');
    const allTurmas: { id: string; nome: string; totalEstudantes: number }[] = await resp.json();
    const turmaById = new Map(allTurmas.map((t) => [t.id, t]));

    setFormState((prev) => {
      const existingById = new Map(prev.turmas.map((t) => [t.id, t]));
      const next: TurmaConfig[] = turmaIds.map((id) => {
        if (existingById.has(id)) return existingById.get(id)!;
        const dados = turmaById.get(id);
        return {
          id,
          nome: dados?.nome ?? id,
          totalEstudantes: dados?.totalEstudantes ?? 0,
          colecao: '',
          professorId: '',
        };
      });
      return { ...prev, turmas: next };
    });

    setDrawerOpen(false);
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await fetch('/api/configuracao', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formState),
    });
    // Atualiza o valor "salvo" para disparar lógica de bloqueio se necessário
    setSavedDataInicio(formState.dataInicio);
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#f5f7fa' }}>

      {/* ── Navegação sticky ─────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'white',
        borderBottom: '1px solid #d5dae4',
        display: 'flex', alignItems: 'center', gap: 0,
        height: 56, paddingRight: 16, flexShrink: 0,
      }}>
        <Link href="/gestor" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 44, height: 44, borderRadius: 8,
          color: '#626c80', textDecoration: 'none', flexShrink: 0, marginLeft: 8,
        }}>
          <ArrowLeftIcon />
        </Link>
        <span style={{
          paddingLeft: 16,
          fontSize: 18, fontWeight: 600, color: '#232831',
          lineHeight: 1.5,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          Configurar Laboratório de Redação
        </span>
      </div>

      {/* ── Conteúdo principal ───────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: '48px 32px' }}>
        <div style={{
          maxWidth: 1194,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}>

          {/* Seção 1 — Definições gerais */}
          <DefinicoesGerais
            value={formState.dataInicio}
            onChange={(v) => setFormState((prev) => ({ ...prev, dataInicio: v }))}
            savedValue={savedDataInicio}
          />

          {/* Seção 2 — Turmas e frequência */}
          <TurmasFrequencia
            turmasSelecionadas={formState.turmas}
            onOpenDrawer={() => setDrawerOpen(true)}
            onChange={(turmas) => setFormState((prev) => ({ ...prev, turmas }))}
          />

          {/* Seção 3 — Liberação das atividades */}
          <LiberacaoAtividades
            colecoesAtivas={[...new Set(formState.turmas.map((t) => t.colecao).filter(Boolean))]}
            value={formState.liberacaoAtividades}
            onChange={(v) => setFormState((prev) => ({ ...prev, liberacaoAtividades: v }))}
          />

          {/* Seção 4 — Devolutiva do apoio inteligente */}
          <LiberacaoDevolutiva
            colecoesAtivas={[...new Set(formState.turmas.map((t) => t.colecao).filter(Boolean))]}
            value={formState.liberacaoDevolutiva}
            onChange={(v) => setFormState((prev) => ({ ...prev, liberacaoDevolutiva: v }))}
          />

          {/* Reset DB — zona de perigo (ocultar em produção) */}
          {process.env.NODE_ENV === 'development' && (
            <details style={{ borderTop: '1px solid #d2d9e5', paddingTop: 24 }}>
              <summary style={{ fontSize: 14, color: '#e53e3e', cursor: 'pointer', fontWeight: 500 }}>
                Zona de perigo (desenvolvimento)
              </summary>
              <div style={{ paddingTop: 16 }}>
                <button
                  onClick={async () => {
                    if (confirm('Resetar todos os dados para o estado inicial?')) {
                      await fetch('/api/admin/seed', { method: 'POST' });
                      window.location.reload();
                    }
                  }}
                  style={{
                    background: '#fff5f5', color: '#e53e3e',
                    padding: '8px 16px', border: '1px solid #e53e3e',
                    borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  }}
                >
                  Resetar banco de dados
                </button>
              </div>
            </details>
          )}

        </div>
      </div>

      {/* ── Drawer de seleção de turmas ─────────────────────────────────── */}
      <DrawerSelecaoTurmas
        open={drawerOpen}
        turmasJaAdicionadas={formState.turmas.map((t) => t.id)}
        onConfirm={handleConfirmDrawer}
        onClose={() => setDrawerOpen(false)}
      />

      {/* ── Bottom bar sticky ────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', bottom: 0, zIndex: 10, flexShrink: 0,
        background: 'white',
        borderTop: '1px solid #d2d9e5',
        padding: '12px 32px',
      }}>
        <div style={{
          maxWidth: 1194, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
        }}>
          <Link
            href="/gestor"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 44, padding: '12px 16px',
              background: 'white', color: '#707780',
              border: '1px solid #c9ced4', borderRadius: 8,
              fontSize: 16, fontWeight: 600,
              cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >
            Voltar
          </Link>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 44, padding: '12px 16px',
              background: canSave && !saving ? 'var(--color-primary)' : '#b6bece',
              color: 'white', border: 'none', borderRadius: 8,
              fontSize: 16, fontWeight: 600,
              cursor: canSave && !saving ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap', transition: 'background 0.15s',
            }}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

    </div>
  );
}
