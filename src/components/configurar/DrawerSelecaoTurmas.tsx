'use client';

import { useEffect, useRef, useState } from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface TurmaDisponivel {
  id: string;
  nome: string;
  serie: string; // derivado do nome, ex: "3ª série"
}

export interface DrawerSelecaoTurmasProps {
  open: boolean;
  /** IDs das turmas já adicionadas na configuração. */
  turmasJaAdicionadas: string[];
  /** Chamado com os IDs selecionados ao confirmar. */
  onConfirm: (turmaIds: string[]) => void;
  /** Fecha o drawer sem salvar. */
  onClose: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extrai o agrupador de série a partir do nome da turma ("3ª série A" → "3ª série"). */
function extractSerie(nome: string): string {
  return nome.replace(/\s+\S+$/, '').trim();
}

/** Agrupa turmas por série mantendo a ordem de inserção. */
function groupBySerie(turmas: TurmaDisponivel[]): { serie: string; turmas: TurmaDisponivel[] }[] {
  const map = new Map<string, TurmaDisponivel[]>();
  for (const t of turmas) {
    const list = map.get(t.serie) ?? [];
    list.push(t);
    map.set(t.serie, list);
  }
  return Array.from(map.entries()).map(([serie, turmas]) => ({ serie, turmas }));
}

// ── Ícone ✕ ───────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M15 5L5 15M5 5l10 10" stroke="#626c80" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ── Checkbox customizado ──────────────────────────────────────────────────────

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        flexShrink: 0,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        flexShrink: 0,
        background: checked ? '#0467db' : 'white',
        border: checked ? 'none' : '1px solid #c9ced4',
        borderRadius: 4,
        transition: 'background 0.1s, border-color 0.1s',
      }}>
        {checked && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function DrawerSelecaoTurmas({ open, turmasJaAdicionadas, onConfirm, onClose }: DrawerSelecaoTurmasProps) {
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<TurmaDisponivel[]>([]);
  const [selecao, setSelecao] = useState<Set<string>>(new Set());
  const initialRef = useRef<Set<string>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);

  // Carrega turmas disponíveis ao abrir
  useEffect(() => {
    if (!open) return;

    fetch('/api/turmas')
      .then((r) => r.json())
      .then((data: { id: string; nome: string }[]) => {
        const mapped: TurmaDisponivel[] = data.map((t) => ({
          id: t.id,
          nome: t.nome,
          serie: extractSerie(t.nome),
        }));
        setTurmasDisponiveis(mapped);
      })
      .catch(() => {});

    // Inicializa seleção com turmas já adicionadas
    const inicial = new Set(turmasJaAdicionadas);
    setSelecao(new Set(inicial));
    initialRef.current = new Set(inicial);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bloqueia scroll do body quando o drawer está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Fecha com Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  function toggleTurma(id: string) {
    setSelecao((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // "Concluir" habilitado quando a seleção atual difere do estado inicial
  function setsAreEqual(a: Set<string>, b: Set<string>): boolean {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }
  const hasChanges = !setsAreEqual(selecao, initialRef.current);

  const grupos = groupBySerie(turmasDisponiveis);

  return (
    <>
      {/* Backdrop — clique fecha sem salvar */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          right: 444,
          background: 'rgba(25,28,31,0.35)',
          zIndex: 40,
        }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Selecionar turmas"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 444,
          background: 'white',
          boxShadow: '0px 14px 20px -8px rgba(25,28,31,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '16px 32px',
          flexShrink: 0,
          background: 'white',
        }}>
          {/* Título + subtítulo */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 600,
              color: '#191c1f',
              lineHeight: 1.25,
              letterSpacing: 0,
            }}>
              Selecionar turmas
            </p>
            <p style={{
              margin: '2px 0 0',
              fontSize: 14,
              fontWeight: 400,
              color: '#707780',
              lineHeight: 1.25,
            }}>
              Você também pode selecionar por estudantes.
            </p>
          </div>

          {/* Botão fechar */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar drawer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              flexShrink: 0,
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              padding: 12,
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content — scrollável */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '16px 32px 32px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {turmasDisponiveis.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: '#abb3c4' }}>Carregando turmas…</p>
          ) : (
            grupos.map(({ serie, turmas }) => (
              <div key={serie}>
                {/* Separador de série */}
                <div style={{
                  paddingTop: 16,
                  paddingBottom: 8,
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#232831',
                    lineHeight: 1.5,
                    letterSpacing: 0,
                  }}>
                    {serie}
                  </p>
                </div>

                {/* Itens de turma */}
                {turmas.map((turma) => {
                  const checked = selecao.has(turma.id);
                  return (
                    <div
                      key={turma.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: 44,
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleTurma(turma.id)}
                    >
                      <Checkbox checked={checked} onChange={() => toggleTurma(turma.id)} />
                      <span style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: '#191c1f',
                        lineHeight: 1.5,
                        padding: '4px 0',
                        userSelect: 'none',
                      }}>
                        {turma.nome}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 8,
          padding: '16px 32px',
          borderTop: '1px solid #e6e9ed',
          flexShrink: 0,
          background: 'white',
        }}>
          {/* Voltar */}
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 44,
              padding: '12px 16px',
              background: 'white',
              color: '#707780',
              border: '1px solid #c9ced4',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
            }}
          >
            Voltar
          </button>

          {/* Concluir */}
          <button
            type="button"
            disabled={!hasChanges}
            onClick={() => {
              if (hasChanges) {
                onConfirm(Array.from(selecao));
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 44,
              padding: '12px 16px',
              background: hasChanges ? '#0d70f2' : '#b6bece',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              lineHeight: 1.5,
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
          >
            Concluir
          </button>
        </div>
      </div>
    </>
  );
}
