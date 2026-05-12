'use client';

import { useMarca } from '@/contexts/MarcaContext';

// ── Constantes de coleção (valores fixos — não variam por marca) ──────────────

const COLECAO_IMAGES_BASE: Record<string, string> = {
  material_didatico: '/images/livro3.png',
};

/** Ordem canônica de exibição dos blocos. */
const COLECAO_ORDER = ['material_didatico', 'material_didatico_pratique'];

/**
 * Expande coleções ativas: se `material_didatico_pratique` está presente,
 * garante que `material_didatico` também apareça (a coleção "M.D. + Pratique"
 * inclui o material didático).
 */
export function expandColecoesAtivas(raw: string[]): string[] {
  const set = new Set(raw);
  if (set.has('material_didatico_pratique')) set.add('material_didatico');
  return COLECAO_ORDER.filter((c) => set.has(c));
}

// ── Radio Button customizado ──────────────────────────────────────────────────

function RadioButton({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 44, height: 44, flexShrink: 0,
        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
      }}
    >
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 24, height: 24, flexShrink: 0,
        background: 'white',
        border: checked ? '2px solid #0467db' : '1px solid #abb3c4',
        borderRadius: '50%',
        transition: 'border-color 0.1s',
      }}>
        {checked && (
          <span style={{
            width: 12, height: 12, borderRadius: '50%', background: '#0467db',
          }} />
        )}
      </span>
    </button>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface LiberacaoAtividadesProps {
  /** Coleções atualmente ativas (derivadas das turmas configuradas). */
  colecoesAtivas: string[];
  /** Mapa colecao → 'automatico' | 'manual'. */
  value: Record<string, 'automatico' | 'manual'>;
  onChange: (v: Record<string, 'automatico' | 'manual'>) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function LiberacaoAtividades({ colecoesAtivas, value, onChange }: LiberacaoAtividadesProps) {
  const marcaConfig = useMarca();
  const colecoes = expandColecoesAtivas(colecoesAtivas);

  /** Labels de coleção resolvidos com o nome da marca ativa */
  const COLECAO_LABELS: Record<string, string> = {
    material_didatico: 'Para o material didático',
    material_didatico_pratique: `Para o ${marcaConfig.nomeColecaoPratique}`,
  };

  /** Imagens de coleção resolvidas com a imagem da marca ativa */
  const COLECAO_IMAGES: Record<string, string> = {
    ...COLECAO_IMAGES_BASE,
    material_didatico_pratique: marcaConfig.imagemColecaoPratique,
  };

  function select(colecao: string, modo: 'automatico' | 'manual') {
    onChange({ ...value, [colecao]: modo });
  }

  return (
    <section style={{
      background: 'white',
      border: '1px solid #d2d9e5',
      borderRadius: 16,
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 32,
      width: '100%',
      boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#232831', lineHeight: 1.25, letterSpacing: '0px' }}>
          Liberação das atividades para estudantes
        </p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: '#808ca3', lineHeight: 1.25, letterSpacing: '0.2px' }}>
          Escolha o modelo de liberação por coleção
        </p>
      </div>

      {/* Blocos de coleção */}
      {colecoes.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14, color: '#abb3c4', lineHeight: 1.5 }}>
          Nenhuma coleção ativa. Configure as turmas para definir a liberação.
        </p>
      ) : (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {colecoes.map((colecao) => {
            const modoAtual = value[colecao];
            return (
              <div
                key={colecao}
                style={{ flex: '1 0 0', minWidth: 280 }}
              >
                {/* Card da coleção */}
                <div style={{
                  background: 'white',
                  border: '1px solid #d2d9e5',
                  borderRadius: 16,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'stretch',
                  height: '100%',
                }}>

                  {/* Imagem lateral */}
                  <div style={{
                    width: 80,
                    flexShrink: 0,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={COLECAO_IMAGES[colecao]}
                      alt={COLECAO_LABELS[colecao]}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        pointerEvents: 'none',
                        borderRadius: 4,
                      }}
                    />
                  </div>

                  {/* Conteúdo */}
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}>

                    {/* Título da coleção */}
                    <p style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 600,
                      color: '#626c80',
                      lineHeight: 1.25,
                      letterSpacing: '-0.2px',
                    }}>
                      {COLECAO_LABELS[colecao]}
                    </p>

                    {/* Radio buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                      {/* Automático */}
                      <div
                        style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}
                        onClick={() => select(colecao, 'automatico')}
                      >
                        <RadioButton
                          checked={modoAtual === 'automatico'}
                          onClick={() => select(colecao, 'automatico')}
                        />
                        <div style={{
                          flex: 1, minWidth: 0,
                          display: 'flex', flexDirection: 'column', gap: 8,
                          justifyContent: 'center', alignSelf: 'stretch',
                          padding: '4px 0',
                        }}>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#232831', lineHeight: 1.5, letterSpacing: '0px' }}>
                            Liberação automática
                          </p>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: '#626c80', lineHeight: 1.25, letterSpacing: '0.2px' }}>
                            As atividades são liberadas na data que o {marcaConfig.nomeOrganizacao} definiu. Professores podem alterar as datas.
                          </p>
                        </div>
                      </div>

                      {/* Manual */}
                      <div
                        style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}
                        onClick={() => select(colecao, 'manual')}
                      >
                        <RadioButton
                          checked={modoAtual === 'manual'}
                          onClick={() => select(colecao, 'manual')}
                        />
                        <div style={{
                          flex: 1, minWidth: 0,
                          display: 'flex', flexDirection: 'column', gap: 8,
                          justifyContent: 'center', alignSelf: 'stretch',
                          padding: '4px 0',
                        }}>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#232831', lineHeight: 1.5, letterSpacing: '0px' }}>
                            Liberação manual
                          </p>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: '#626c80', lineHeight: 1.25, letterSpacing: '0.2px' }}>
                            O professor é quem decide quando libera cada atividade
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
