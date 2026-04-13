'use client';

import { useEffect, useState } from 'react';
import { TurmaConfig } from '@/app/gestor/configurar/page';
import { useMarca } from '@/contexts/MarcaContext';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Professor {
  id: string;
  nome: string;
}

// ── Ícones ────────────────────────────────────────────────────────────────────

const PlusCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6.5v7M6.5 10h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M5 7.5l5 5 5-5" stroke="#808ca3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MinusCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-label="Remover turma">
    <circle cx="10" cy="10" r="8.5" stroke="#c0392b" strokeWidth="1.5" />
    <path d="M7 10h6" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ── Estilos reutilizáveis ─────────────────────────────────────────────────────

const selectContainerStyle = (borderColor: string): React.CSSProperties => ({
  position: 'relative',
  flex: 1,
  minWidth: 0,
  height: 44,
});

const selectStyle = (filled: boolean): React.CSSProperties => ({
  width: '100%',
  height: 44,
  border: `1px solid ${filled ? '#abb3c4' : '#b6bece'}`,
  borderRadius: 8,
  background: 'white',
  fontSize: 16,
  fontWeight: 400,
  color: filled ? '#232831' : '#808ca3',
  paddingLeft: 12,
  paddingRight: 36,
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  cursor: 'pointer',
  outline: 'none',
  boxSizing: 'border-box' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
});

const chevronOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface TurmasFrequenciaProps {
  turmasSelecionadas: TurmaConfig[];
  onOpenDrawer: () => void;
  onChange: (turmas: TurmaConfig[]) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function TurmasFrequencia({ turmasSelecionadas, onOpenDrawer, onChange }: TurmasFrequenciaProps) {
  const marcaConfig = useMarca();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const isEmpty = turmasSelecionadas.length === 0;

  // Busca lista de professores ao montar
  useEffect(() => {
    fetch('/api/professores')
      .then((r) => r.json())
      .then(setProfessores)
      .catch(() => {});
  }, []);

  function updateTurma(id: string, patch: Partial<TurmaConfig>) {
    onChange(turmasSelecionadas.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function removeTurma(id: string) {
    onChange(turmasSelecionadas.filter((t) => t.id !== id));
  }

  return (
    <section style={{
      background: 'white',
      border: '1px solid #d5dae4',
      borderRadius: 16,
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      width: '100%',
      boxSizing: 'border-box',
    }}>

      {/* Header — título, subtítulo e botão */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        width: '100%',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#232831', lineHeight: 1.25, letterSpacing: '0px' }}>
            Turmas e coleções
          </p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: '#808ca3', lineHeight: 1.25, letterSpacing: '0.2px' }}>
            Escolha a ordem dos blocos, quantidade de questões e responsáveis por colocar questões.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenDrawer}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, minHeight: 44, padding: '12px 16px',
            background: 'white', color: '#808ca3',
            border: '1px solid #b6bece', borderRadius: 8,
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.5,
          }}
        >
          <PlusCircleIcon />
          Adicionar turmas
        </button>
      </div>

      {/* Conteúdo */}
      {!isEmpty && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {/* Lista de turmas agrupada em card com borda */}
          <div style={{
            border: '1px solid #e6e9ed',
            borderRadius: 16,
            overflow: 'hidden',
            width: '100%',
          }}>
            {turmasSelecionadas.map((turma, idx) => {
              const isLast = idx === turmasSelecionadas.length - 1;
              return (
                <div
                  key={turma.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 64,
                    background: 'white',
                    borderBottom: isLast ? 'none' : '1px solid #e6e9ed',
                    padding: '0 8px',
                    gap: 0,
                  }}
                >
                  {/* Coluna 1 — Nome + estudantes (25%) */}
                  <div style={{
                    flex: '0 0 25%',
                    minWidth: 0,
                    padding: '4px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 2,
                  }}>
                    <span style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: '#232831',
                      lineHeight: 1.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {turma.nome}
                    </span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: '#626c80',
                      lineHeight: 1.25,
                      letterSpacing: '0.2px',
                      whiteSpace: 'nowrap',
                    }}>
                      {turma.totalEstudantes} estudantes
                    </span>
                  </div>

                  {/* Coluna 2 — Select Coleção (~37%) */}
                  <div style={{ flex: '0 0 37.5%', padding: '4px 8px', position: 'relative', height: 44 }}>
                    <select
                      value={turma.colecao}
                      onChange={(e) => updateTurma(turma.id, { colecao: e.target.value as TurmaConfig['colecao'] })}
                      style={selectStyle(turma.colecao !== '')}
                      aria-label="Coleção"
                    >
                      <option value="" disabled hidden>Selecione a coleção</option>
                      <option value="material_didatico">Material didático</option>
                      <option value="material_didatico_pratique">Material didático + {marcaConfig.nomeColecaoPratique}</option>
                    </select>
                    <span style={chevronOverlayStyle}><ChevronDownIcon /></span>
                  </div>

                  {/* Coluna 3 — Select Professor (~37%) */}
                  <div style={{ flex: 1, padding: '4px 8px', position: 'relative', height: 44 }}>
                    <select
                      value={turma.professorId}
                      onChange={(e) => updateTurma(turma.id, { professorId: e.target.value })}
                      style={{
                        ...selectStyle(turma.professorId !== ''),
                        border: `1px solid ${turma.professorId !== '' ? '#abb3c4' : '#b6bece'}`,
                      }}
                      aria-label="Professor"
                    >
                      <option value="" disabled hidden>Professor</option>
                      {professores.map((p) => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                    <span style={chevronOverlayStyle}><ChevronDownIcon /></span>
                  </div>

                  {/* Coluna 4 — Botão remover (44px) */}
                  <div style={{ flexShrink: 0, padding: '0 4px' }}>
                    <button
                      type="button"
                      onClick={() => removeTurma(turma.id)}
                      aria-label={`Remover ${turma.nome}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 44, height: 44,
                        background: 'transparent', border: 'none',
                        borderRadius: 8, cursor: 'pointer', padding: 12,
                        flexShrink: 0,
                      }}
                    >
                      <MinusCircleIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
