'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CorrecaoRascunho, CompetenciaCorrecao } from '@/types'
import { useMarca } from '@/contexts/MarcaContext'

// ─── Types ────────────────────────────────────────────────────────────────────

type Aba = 'proposta' | 'correcao' | 'resultados'
type SubItem = 'manual-pedagogico' | 'proposta-docente' | 'material-apoio' | 'proposta-estudante'
type PanelTab = 'nota' | 'comentarios'
type Tool = 'cursor' | 'marker' | 'arrow' | 'hand' | 'zoom'

interface PropostaAPI {
  id: string
  titulo: string
  dataAgendada: string
  dataVisivel?: string
  status: string
  colecao: { id: string; nome: string; cor: string }
}

interface QueueItem {
  id: string
  alunoId: string
  turmaId: string
  status: string
  aluno: { id: string; nome: string } | null
  turma: { id: string; nome: string } | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PILL_VALUES = [40, 80, 120, 160, 200, 0]

const AI_GRADIENT = 'linear-gradient(118deg, rgb(5,113,255) 7.8%, rgb(61,74,198) 37.3%, rgb(113,38,145) 79.3%, rgb(3,68,153) 139.4%)'

// Pill with AI suggestion: frosted gradient bg + gradient text
const AI_PILL_BG = 'linear-gradient(90deg, rgba(255,255,255,0.85), rgba(255,255,255,0.85)), linear-gradient(118.33deg, #0571ff 7.85%, #3d4ac6 37.26%, #712691 79.27%, #034499 139.42%)'
const AI_TEXT_GRADIENT = 'linear-gradient(106.58deg, #0571ff 7.85%, #3d4ac6 37.26%, #712691 79.27%, #034499 139.42%)'

const COMP_COLORS: Record<string, string> = {
  C1: '#7c3aed',
  C2: '#0d4ad6',
  C3: '#059669',
  C4: '#d97706',
  C5: '#dc2626',
}

// ENEM competency labels (used in empty state without rascunho)
const COMPETENCIAS_INFO = [
  { codigo: 'C1', titulo: 'Dominar a escrita formal' },
  { codigo: 'C2', titulo: 'Compreender o tema' },
  { codigo: 'C3', titulo: 'Interpretar e organizar ideias' },
  { codigo: 'C4', titulo: 'Dominar a argumentação' },
  { codigo: 'C5', titulo: 'Propor solução respeitosa' },
]

// ─── Shared styles ────────────────────────────────────────────────────────────

const iconBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28,
  border: 'none', borderRadius: 'var(--radius-sm)',
  background: 'transparent', color: 'var(--text-caption)',
  cursor: 'pointer', fontSize: 14, lineHeight: 1,
}

// ─── StatusIndicator (bullet + texto, sem fundo) ──────────────────────────────

function StatusIndicator({ dataAgendada, status }: { dataAgendada: string; status: string }) {
  if (status === 'descartada') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#626c80', flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: '#626c80', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
          Descartada
        </span>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const isOculto = dataAgendada > today
  const parts = dataAgendada.split('-')
  const label = isOculto
    ? `Oculto até ${parts[2]}/${parts[1]}`
    : `Visível desde ${parts[2]}/${parts[1]}`
  const color = isOculto ? '#0f5384' : '#0c7742'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 14, fontWeight: 500, color, whiteSpace: 'nowrap', lineHeight: 1.5 }}>
        {label}
      </span>
    </div>
  )
}

// ─── Tab button (header) ──────────────────────────────────────────────────────

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative',
      display: 'flex', alignItems: 'center',
      padding: 12, height: 44,
      border: 'none', borderRadius: '8px 8px 0 0',
      background: 'transparent',
      color: active ? '#232831' : '#626c80',
      fontSize: 16, fontWeight: 500,
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>
      {label}
      {active && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 4, background: '#0079ce',
          borderRadius: '4px 4px 0 0',
        }} />
      )}
    </button>
  )
}

// ─── Sidebar item ─────────────────────────────────────────────────────────────

function SidebarItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'block', width: '100%', textAlign: 'left',
      padding: 8, border: 'none', borderRadius: 4,
      background: active ? '#cceaff' : 'transparent',
      color: active ? '#0460a1' : '#232831',
      fontSize: 14, fontWeight: 500,
      cursor: 'pointer', transition: 'background 0.1s',
      lineHeight: 1.5,
    }}>
      {label}
    </button>
  )
}

function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      margin: 0,
      fontSize: 14, fontWeight: 400,
      color: '#626c80',
      letterSpacing: '0.2px', lineHeight: 1.25,
    }}>
      {children}
    </p>
  )
}

// ─── Mapeamento de conteúdo por sub-item ─────────────────────────────────────

const PDF_SOURCES: Record<SubItem, string | null> = {
  'manual-pedagogico':  null,
  'proposta-docente':   null,
  'material-apoio':     null,
  'proposta-estudante': '/pdfs/proposta-estudante.pdf',
}

const VIDEO_SOURCES: Record<SubItem, string | null> = {
  'manual-pedagogico':  null,
  'proposta-docente':   null,
  'material-apoio':     'https://player.vimeo.com/video/1122031196?controls=1&transparent=0&dnt=1&api=1&playsinline=1&title=0&byline=0&portrait=0',
  'proposta-estudante': null,
}

// ─── Real PDF Viewer (iframe) ─────────────────────────────────────────────────

function RealPDFViewer({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      title="Visualizador de PDF"
    />
  )
}

// ─── Vimeo Player ─────────────────────────────────────────────────────────────

function VimeoPlayer({ src }: { src: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Material de apoio"
      />
    </div>
  )
}

// ─── Mock PDF Viewer ──────────────────────────────────────────────────────────

function DocLine({ width, height = 8, color = '#e5e7eb', mt = 6 }: { width: string | number; height?: number; color?: string; mt?: number }) {
  return <div style={{ width, height, borderRadius: 2, background: color, marginTop: mt, flexShrink: 0 }} />
}

function ManualContent() {
  return (
    <div style={{ padding: '40px 56px', boxSizing: 'border-box', maxWidth: 680, width: '100%' }}>
      <div style={{ background: '#1a3a5c', color: '#fff', borderRadius: 4, padding: '6px 12px', display: 'inline-block', fontSize: 11, fontWeight: 600, marginBottom: 16 }}>
        MANUAL PEDAGÓGICO
      </div>
      <DocLine width="75%" height={18} color="#1a3a5c" mt={0} />
      <DocLine width="45%" height={10} color="#94a3b8" mt={8} />
      <div style={{ height: 24 }} />
      <DocLine width="30%" height={10} color="#475569" mt={0} />
      <DocLine width="92%" mt={10} />
      <DocLine width="88%" />
      <DocLine width="95%" />
      <DocLine width="70%" />
      <div style={{ height: 16 }} />
      <DocLine width="35%" height={10} color="#475569" mt={0} />
      <DocLine width="90%" mt={10} />
      <DocLine width="93%" />
      <DocLine width="85%" />
      <DocLine width="91%" />
      <DocLine width="60%" />
      <div style={{ height: 16 }} />
      {[80, 75, 85, 70, 78].map((w, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#1a3a5c', flexShrink: 0, marginTop: 2 }} />
          <DocLine width={`${w}%`} mt={0} />
        </div>
      ))}
      <div style={{ height: 20 }} />
      <DocLine width="40%" height={10} color="#475569" mt={0} />
      <DocLine width="88%" mt={10} />
      <DocLine width="92%" />
      <DocLine width="66%" />
    </div>
  )
}

function ENEMContent({ showToolbar }: { showToolbar: boolean }) {
  return (
    <div style={{ padding: '32px 48px', boxSizing: 'border-box', maxWidth: 680, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a3a5c', letterSpacing: '-0.5px' }}>ENEM 2025</div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>Exame Nacional do Ensino Médio</div>
        </div>
        <div style={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          {[3,5,2,4,6,3,5,2,4,3,5,6,2,4,3].map((h, i) => (
            <div key={i} style={{ width: 2, height: h * 3, background: '#1a3a5c' }} />
          ))}
        </div>
      </div>
      <div style={{ height: 1, background: '#1a3a5c', marginBottom: 16 }} />
      <div style={{ fontSize: 12, fontWeight: 700, color: '#1a3a5c', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Proposta de Redação
      </div>
      <DocLine width="95%" height={7} color="#334155" mt={0} />
      <DocLine width="88%" height={7} color="#334155" />
      <DocLine width="92%" height={7} color="#334155" />
      <DocLine width="70%" height={7} color="#334155" />
      <div style={{ height: 18 }} />
      <div style={{ fontSize: 11, fontWeight: 700, color: '#1a3a5c', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Textos motivadores
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { label: 'Texto I', lines: [85, 90, 80, 88, 75, 82, 68] },
          { label: 'Texto II', lines: [88, 82, 90, 75, 85, 70, 80] },
          { label: 'Texto III', lines: [80, 88, 75, 92, 68, 85, 72] },
          { label: 'Texto IV', lines: [90, 78, 88, 72, 85, 80, 65] },
        ].map(({ label, lines }) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{label}</div>
            {lines.map((w, i) => <DocLine key={i} width={`${w}%`} height={6} mt={5} />)}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: '10px 14px', border: '1px solid #1a3a5c', borderRadius: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#1a3a5c', marginBottom: 6 }}>INSTRUÇÃO</div>
        <DocLine width="95%" height={6} color="#475569" mt={0} />
        <DocLine width="88%" height={6} color="#475569" />
        <DocLine width="72%" height={6} color="#475569" />
      </div>
      {showToolbar && null}
    </div>
  )
}

function MockPDFViewer({ showToolbar = false, content = 'manual' }: { showToolbar?: boolean; content?: 'manual' | 'enem' }) {
  const [zoom, setZoom] = useState(100)
  const [page, setPage] = useState(1)
  const totalPages = content === 'manual' ? 6 : 4

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        padding: '6px 16px', flexShrink: 0,
        background: '#39404d',
      }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          style={{ ...iconBtn, color: '#f5f7fa', opacity: page === 1 ? 0.35 : 1 }}>‹</button>
        <span style={{ fontSize: 12, color: '#f5f7fa', minWidth: 48, textAlign: 'center' }}>
          {page} / {totalPages}
        </span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
          style={{ ...iconBtn, color: '#f5f7fa', opacity: page === totalPages ? 0.35 : 1 }}>›</button>
        <div style={{ width: 1, height: 16, background: 'rgba(245,247,250,0.2)' }} />
        <button onClick={() => setZoom(z => Math.max(50, z - 25))}
          style={{ ...iconBtn, color: '#f5f7fa' }}>−</button>
        <span style={{ fontSize: 12, color: '#f5f7fa', minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
        <button onClick={() => setZoom(z => Math.min(200, z + 25))}
          style={{ ...iconBtn, color: '#f5f7fa' }}>+</button>
      </div>
      <div style={{
        flex: 1, overflow: 'auto', background: '#e2e8f0',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 16px', gap: 16,
      }}>
        <div style={{
          width: `${zoom}%`, maxWidth: 680,
          background: '#fff', borderRadius: 4,
          boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
          minHeight: 480,
          display: 'flex', justifyContent: 'center',
        }}>
          {content === 'manual' ? <ManualContent /> : <ENEMContent showToolbar={showToolbar} />}
        </div>
      </div>
    </div>
  )
}

// ─── Mock Video Player ────────────────────────────────────────────────────────

function MockVideoPlayer() {
  const [playing, setPlaying] = useState(false)
  const [progress] = useState(32)
  const [volume, setVolume] = useState(true)

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px', gap: 20, background: 'var(--bg-secondary)',
      overflow: 'auto',
    }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 720,
        aspectRatio: '16 / 9', borderRadius: 10, overflow: 'hidden',
        background: '#0f172a', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0a2a4a 50%, #1a3a5c 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📽</div>
            <div style={{ fontSize: 13, letterSpacing: '0.05em' }}>Material de Apoio</div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.6 }}>Redação ENEM — Competências e Estratégias</div>
          </div>
        </div>
        {!playing && (
          <button onClick={() => setPlaying(true)} style={{ position: 'absolute', inset: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>▶</div>
          </button>
        )}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.25)', borderRadius: 2, marginBottom: 10, cursor: 'pointer', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${progress}%`, background: '#3b9bde', borderRadius: 2 }} />
            <div style={{ position: 'absolute', top: '50%', left: `${progress}%`, transform: 'translate(-50%, -50%)', width: 10, height: 10, borderRadius: '50%', background: '#fff', boxShadow: '0 0 4px rgba(0,0,0,0.5)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setPlaying(p => !p)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1, width: 24 }}>{playing ? '⏸' : '▶'}</button>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>12:45 / 40:00</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => setVolume(v => !v)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 15, padding: 0 }}>{volume ? '🔊' : '🔇'}</button>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 12, padding: 0 }}>⚙</button>
            <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.5)', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 11, padding: '0 2px', borderRadius: 2 }}>CC</button>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 14, padding: 0 }}>⛶</button>
          </div>
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 720 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-body)' }}>Competências e Estratégias de Redação ENEM</div>
        <div style={{ fontSize: 13, color: 'var(--text-caption)', marginTop: 4 }}>Material de apoio • 40 min</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA CORREÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Essay Paper Mock ─────────────────────────────────────────────────────────

const ESSAY_PARAGRAPHS = [
  'A sociedade brasileira enfrenta, nos dias atuais, o fenômeno do',
  'envelhecimento populacional acelerado. Esse processo, consequência',
  'da melhoria nas condições de saúde e da queda nas taxas de',
  'natalidade, impõe desafios significativos às políticas públicas.',
  '',
  'Nesse contexto, observa-se que a terceira idade ainda é alvo de',
  'preconceitos e exclusão no mercado de trabalho. A imagem',
  'estereotipada do idoso como improdutivo compromete sua inserção',
  'social e contribui para o isolamento e problemas de saúde mental.',
  '',
  'Sob essa ótica, é fundamental compreender que o envelhecimento',
  'digno depende de uma rede de suporte integrada. Cabe ao Estado',
  'ampliar os programas de assistência social, garantindo acesso',
  'a serviços de saúde, transporte e lazer para idosos.',
  '',
  'Portanto, para que a sociedade brasileira enfrente os desafios',
  'do envelhecimento, é necessário que o governo federal, em parceria',
  'com municípios e organizações civis, implemente políticas públicas',
  'de inclusão, respeitando a dignidade e os direitos dos idosos.',
]

// Annotation highlights: [lineIndex, startFraction, widthFraction, color]
const HIGHLIGHTS: [number, number, number, string][] = [
  [2,  0.0, 0.85, 'rgba(253,224,71,0.45)'],   // amarelo — trecho C2
  [6,  0.0, 0.75, 'rgba(167,243,208,0.5)'],    // verde — trecho C3
  [11, 0.0, 0.90, 'rgba(196,181,253,0.45)'],   // roxo — trecho C5
]

function EssayPaper() {
  const LINE_H = 28
  const PADDING_H = 48
  const PADDING_V = 40
  const MARGIN_LEFT = 56

  return (
    <div style={{
      background: '#fff',
      width: 500,
      flexShrink: 0,
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      position: 'relative',
      paddingTop: PADDING_V,
      paddingBottom: PADDING_V,
      paddingLeft: MARGIN_LEFT + PADDING_H,
      paddingRight: PADDING_H,
      boxSizing: 'border-box',
    }}>
      {/* Margin line */}
      <div style={{ position: 'absolute', left: MARGIN_LEFT, top: 0, bottom: 0, width: 1.5, background: 'rgba(252,165,165,0.7)' }} />

      {/* Ruled lines */}
      {ESSAY_PARAGRAPHS.map((_, i) => (
        <div key={`line-${i}`} style={{
          position: 'absolute',
          left: 0, right: 0,
          top: PADDING_V + i * LINE_H + LINE_H - 1,
          height: 1,
          background: '#dbeafe',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Highlight overlays */}
      {HIGHLIGHTS.map(([li, sf, wf, color], hi) => (
        <div key={`hl-${hi}`} style={{
          position: 'absolute',
          left: MARGIN_LEFT + PADDING_H + sf * (500 - MARGIN_LEFT - PADDING_H * 2),
          top: PADDING_V + li * LINE_H,
          width: wf * (500 - MARGIN_LEFT - PADDING_H * 2),
          height: LINE_H,
          background: color,
          pointerEvents: 'none',
          borderRadius: 2,
        }} />
      ))}

      {/* Text */}
      <div style={{ position: 'relative' }}>
        {ESSAY_PARAGRAPHS.map((line, i) => (
          <div key={i} style={{
            height: LINE_H,
            lineHeight: `${LINE_H}px`,
            fontSize: 11.5,
            color: line === '' ? 'transparent' : '#1e293b',
            fontFamily: '"Georgia", serif',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}>
            {line || '\u00a0'}
          </div>
        ))}
      </div>

      {/* Annotation markers (colored dots on margin) */}
      {HIGHLIGHTS.map(([li,,,color], hi) => (
        <div key={`dot-${hi}`} style={{
          position: 'absolute',
          left: MARGIN_LEFT - 10,
          top: PADDING_V + li * LINE_H + LINE_H / 2 - 5,
          width: 10, height: 10,
          borderRadius: '50%',
          background: color.replace('0.4', '1').replace('0.45', '1').replace('0.5', '1'),
          border: '1.5px solid rgba(0,0,0,0.15)',
        }} />
      ))}
    </div>
  )
}

// ─── Annotation Toolbar ───────────────────────────────────────────────────────

function AnnotationToolbar({ activeTool, onToolChange }: { activeTool: Tool; onToolChange: (t: Tool) => void }) {
  const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
    {
      id: 'cursor', label: 'Cursor',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 2L13 8L8 9L6 14L3 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
        </svg>
      ),
    },
    {
      id: 'marker', label: 'Marcador',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="6" y="2" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 11L8 14L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'arrow', label: 'Seta',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      id: 'hand', label: 'Mão',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 10V5M8 5C8 4.4 8.4 4 9 4C9.6 4 10 4.4 10 5V8M8 5C8 4.4 7.6 4 7 4C6.4 4 6 4.4 6 5V8M10 7C10 6.4 10.4 6 11 6C11.6 6 12 6.4 12 7V9C12 11.2 10.2 13 8 13C5.8 13 4 11.2 4 9V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      id: 'zoom', label: 'Zoom',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5 7H9M7 5V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{
      width: 48, flexShrink: 0,
      borderRight: '1px solid var(--border-secondary)',
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '12px 0', gap: 2,
    }}>
      {tools.map(tool => (
        <button
          key={tool.id}
          title={tool.label}
          onClick={() => onToolChange(tool.id)}
          style={{
            width: 36, height: 36, borderRadius: 6, border: 'none',
            background: activeTool === tool.id ? '#cceaff' : 'transparent',
            color: activeTool === tool.id ? '#0460a1' : '#626c80',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.1s',
          }}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}

// ─── AI Sparkle icon ─────────────────────────────────────────────────────────

function AISparkle({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L9.8 6.2L14 8L9.8 9.8L8 14L6.2 9.8L2 8L6.2 6.2Z" fill={color} />
    </svg>
  )
}

// ─── Competency color icon (stroke circle + inner dot) ────────────────────────

function CompColorIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
      <circle cx="8" cy="8" r="3.5" fill={color} />
    </svg>
  )
}

// ─── Panel tab button ─────────────────────────────────────────────────────────

function PanelTabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      position: 'relative', height: 54, padding: '0 20px',
      border: 'none', background: 'transparent',
      color: active ? '#232831' : '#626c80',
      fontSize: 16, fontWeight: active ? 600 : 400,
      cursor: 'pointer', whiteSpace: 'nowrap',
      transition: 'color 0.15s',
    }}>
      {label}
      {active && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 4, background: '#0d4ad6',
          borderRadius: '4px 4px 0 0',
        }} />
      )}
    </button>
  )
}

// ─── Nota Tab (C1–C5 competency blocks) ──────────────────────────────────────

function NotaTab({
  rascunho,
  notas,
  onNotaChange,
}: {
  rascunho: CorrecaoRascunho
  notas: Record<string, number>
  onNotaChange: (codigo: string, nota: number) => void
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    rascunho.competencias.forEach(c => { init[c.codigo] = true })
    return init
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {rascunho.competencias.map(comp => {
        const compColor = COMP_COLORS[comp.codigo] ?? '#626c80'
        const isOpen = expanded[comp.codigo] !== false
        const aiNota = comp.nota        // AI's original suggestion
        const currentNota = notas[comp.codigo]  // professor's current selection

        return (
          <div key={comp.codigo} style={{ background: '#fff' }}>
            {/* Horizontal Divider — 1px #d2d9e5 */}
            <div style={{ height: 1, background: '#d2d9e5', width: '100%', flexShrink: 0 }} />

            {/* ── competencia-titulo ─────────────────────────────── */}
            {/* pt-16 px-16 pb-0, flex items-center justify-between */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 16, paddingLeft: 16, paddingRight: 0, paddingBottom: 0,
            }}>
              {/* .competence-tag — w-280 h-24 gap-8 overflow-hidden */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: 280, height: 24, overflow: 'hidden', flexShrink: 0,
              }}>
                {/* tag: color icon + right-border separator + C-code (16px/500/#232831) */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  paddingRight: 8, borderRight: '1px solid #d2d9e5', flexShrink: 0,
                }}>
                  <CompColorIcon color={compColor} />
                  <span style={{ fontSize: 16, fontWeight: 500, color: '#232831', lineHeight: 1.5, whiteSpace: 'nowrap' }}>
                    {comp.codigo}
                  </span>
                </div>
                {/* Competency name — 14px/500/#232831 */}
                <span style={{
                  fontSize: 14, fontWeight: 500, color: '#232831',
                  lineHeight: 1.5, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {comp.titulo}
                </span>
              </div>

              {/* Chevron Right button — min-h-32 min-w-44 px-12 py-4 rounded-8 transparent */}
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [comp.codigo]: !isOpen }))}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minHeight: 32, minWidth: 44, padding: '4px 12px',
                  borderRadius: 8, border: 'none',
                  background: 'transparent', color: '#626c80', cursor: 'pointer', flexShrink: 0,
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
                aria-label={isOpen ? 'Recolher' : 'Expandir'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {isOpen && (
              <>
                {/* ── competencia-notas: pills ──────────────────────── */}
                {/* flex-wrap justify-between rowGap-4 px-12 py-16 */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', rowGap: 4,
                  alignItems: 'flex-start', justifyContent: 'space-between',
                  padding: '16px 12px',
                }}>
                  {PILL_VALUES.map(val => {
                    const isActive = currentNota === val
                    const isAI = aiNota === val

                    if (isAI) {
                      // AI-suggested pill: frosted gradient bg + #0571ff border + AI icon + gradient text
                      return (
                        <button key={val} onClick={() => onNotaChange(comp.codigo, val)} style={{
                          height: 32, padding: '0 12px', borderRadius: 9999,
                          border: '1px solid #0571ff', background: AI_PILL_BG,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                          <AISparkle size={16} color="#0571ff" />
                          <span style={{
                            background: AI_TEXT_GRADIENT,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            fontSize: 14, fontWeight: 500,
                          }}>
                            {val === 0 ? 'Zero' : val}
                          </span>
                        </button>
                      )
                    }

                    if (isActive) {
                      // Professor overrode AI: solid comp color pill
                      return (
                        <button key={val} onClick={() => onNotaChange(comp.codigo, val)} style={{
                          height: 32, padding: '0 12px', borderRadius: 9999, border: 'none',
                          background: compColor, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                        }}>
                          {val === 0 ? 'Zero' : val}
                        </button>
                      )
                    }

                    // Default unselected pill: white bg, #abb3c4 border, 14px/500/#626c80
                    return (
                      <button key={val} onClick={() => onNotaChange(comp.codigo, val)} style={{
                        height: 32, padding: '0 12px', borderRadius: 9999,
                        border: '1px solid #abb3c4', background: '#fff',
                        color: '#626c80', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                      }}>
                        {val === 0 ? 'Zero' : val}
                      </button>
                    )
                  })}
                </div>

                {/* ── AiReason: px-16 pb-16, flex gap-8 items-start ── */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '0 16px 16px' }}>
                  {/* Left col: AI icon (20px) + vertical line (1px, flex-grow) */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 8, alignSelf: 'stretch', flexShrink: 0,
                  }}>
                    <AISparkle size={20} color="#626c80" />
                    <div style={{ flex: '1 0 0', width: 1, background: '#d2d9e5', minHeight: 1 }} />
                  </div>
                  {/* Right col: body text (14px/400/#232831) + "Mais detalhes" button */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: '#232831', lineHeight: 1.5 }}>
                      {comp.comentario}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button style={{
                        fontSize: 14, fontWeight: 500, color: '#626c80',
                        background: 'none', border: 'none', padding: '4px 12px', borderRadius: 8, cursor: 'pointer',
                      }}>
                        Mais detalhes
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Comentários Tab ──────────────────────────────────────────────────────────

function ComentariosTab({
  rascunho,
  comentarios,
  comentarioGeral,
  onComentarioChange,
  onComentarioGeralChange,
}: {
  rascunho: CorrecaoRascunho
  comentarios: Record<string, string>
  comentarioGeral: string
  onComentarioChange: (codigo: string, text: string) => void
  onComentarioGeralChange: (text: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* "Todos os comentários" chip */}
      <div style={{ padding: '16px 24px 12px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 14px', borderRadius: 20,
          fontSize: 13, fontWeight: 500, color: '#0d4ad6',
          background: 'rgba(13,74,214,0.08)',
          border: '1px solid rgba(13,74,214,0.2)',
        }}>
          Todos os comentários
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#d2d9e5' }} />

      {/* Comentário geral card */}
      <div style={{ padding: '16px 24px' }}>
        <div style={{
          borderRadius: 16, border: '1px solid #d2d9e5',
          padding: '14px 16px',
          background: '#fff',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#f5f7fa', border: '1px solid #d2d9e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 15, color: '#626c80',
          }}>
            ✏️
          </div>
          <textarea
            value={comentarioGeral}
            onChange={e => onComentarioGeralChange(e.target.value)}
            placeholder="Adicione um comentário geral sobre a redação…"
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              fontSize: 13, color: '#232831', lineHeight: 1.6,
              fontFamily: 'inherit', background: 'transparent',
              minHeight: 56, padding: 0,
            }}
          />
        </div>
      </div>

      {/* Per-competency comment input cards */}
      {rascunho.competencias.map((comp) => {
        const compColor = COMP_COLORS[comp.codigo] ?? '#626c80'
        return (
          <div key={comp.codigo}>
            <div style={{ height: 1, background: '#d2d9e5' }} />
            <div style={{ padding: '14px 24px' }}>
              {/* Comment card header */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                {/* Avatar with C-tag */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#cceaff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 10, fontWeight: 800, color: '#0f5384',
                  letterSpacing: '-0.5px',
                }}>
                  {comp.codigo}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: compColor,
                      background: compColor + '1a',
                      padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                    }}>
                      {comp.codigo}
                    </span>
                    <span style={{
                      fontSize: 12, color: '#626c80',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {comp.titulo}
                    </span>
                  </div>
                  <textarea
                    value={comentarios[comp.codigo] ?? ''}
                    onChange={e => onComentarioChange(comp.codigo, e.target.value)}
                    placeholder={`Comentário sobre ${comp.codigo}…`}
                    style={{
                      width: '100%', padding: '8px 10px',
                      fontSize: 12, lineHeight: 1.6,
                      borderRadius: 8, border: '1px solid #d2d9e5',
                      resize: 'vertical', color: '#232831',
                      background: '#f5f7fa', fontFamily: 'inherit',
                      boxSizing: 'border-box', minHeight: 60,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

const COMP_COLORS_LIST = Object.entries(COMP_COLORS)

function RightPanel({
  notaFinal,
  rascunho,
  notas,
  comentarios,
  comentarioGeral,
  panelTab,
  validating,
  rascunhoLoading,
  onNotaChange,
  onComentarioChange,
  onComentarioGeralChange,
  onPanelTabChange,
  onValidar,
}: {
  notaFinal: number
  rascunho: CorrecaoRascunho | null
  notas: Record<string, number>
  comentarios: Record<string, string>
  comentarioGeral: string
  panelTab: PanelTab
  validating: boolean
  rascunhoLoading: boolean
  onNotaChange: (codigo: string, nota: number) => void
  onComentarioChange: (codigo: string, text: string) => void
  onComentarioGeralChange: (text: string) => void
  onPanelTabChange: (tab: PanelTab) => void
  onValidar: () => void
}) {
  const hasRascunho = !!rascunho && !rascunhoLoading
  const pct = hasRascunho ? Math.round((notaFinal / 1000) * 100) : 0
  const scoreDisplay = hasRascunho ? String(notaFinal) : '—'

  return (
    <div style={{
      width: 356, flexShrink: 0,
      borderLeft: '1px solid #d2d9e5',
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Nota final section ───────────────────────────────────────────── */}
      <div style={{
        padding: '20px 24px 16px',
        position: 'relative',
        flexShrink: 0,
      }}>
        {/* "Corrigir" AI pill — visible only in empty/no-rascunho state */}
        {!hasRascunho && !rascunhoLoading && (
          <button style={{
            position: 'absolute', top: 20, right: 24,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 32, padding: '0 14px',
            borderRadius: 20, border: 'none',
            background: AI_GRADIENT,
            color: '#fff',
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}>
            <AISparkle size={12} color="#fff" />
            Corrigir
          </button>
        )}

        {/* Label */}
        <div style={{ fontSize: 14, color: '#626c80', marginBottom: 6, lineHeight: 1.4 }}>
          Nota final
        </div>

        {/* Score row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
          <span style={{ fontSize: 28, fontWeight: 600, color: '#232831', lineHeight: 1 }}>
            {scoreDisplay}
          </span>
          <span style={{ fontSize: 16, fontWeight: 400, color: '#626c80' }}>
            /1.000
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 8, borderRadius: 4,
          background: 'rgba(115,127,186,0.14)',
          overflow: 'hidden',
        }}>
          {hasRascunho && (
            <div style={{
              height: '100%', width: `${pct}%`,
              background: '#3b9bde',
              borderRadius: 4,
              transition: 'width 0.35s ease',
            }} />
          )}
        </div>
      </div>

      {/* ── Panel tabs ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid #d2d9e5',
        borderBottom: '1px solid #d2d9e5',
        flexShrink: 0,
      }}>
        <PanelTabBtn label="Nota" active={panelTab === 'nota'} onClick={() => onPanelTabChange('nota')} />
        <PanelTabBtn label="Comentários" active={panelTab === 'comentarios'} onClick={() => onPanelTabChange('comentarios')} />
      </div>

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {rascunhoLoading ? (
          <div style={{ color: '#626c80', fontSize: 13, textAlign: 'center', paddingTop: 56 }}>
            Carregando correção…
          </div>
        ) : !rascunho ? (
          /* State=Empty: full .box-competencia structure, pills disabled */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {COMPETENCIAS_INFO.map(({ codigo, titulo }) => {
              const color = COMP_COLORS[codigo] ?? '#626c80'
              return (
                <div key={codigo} style={{ background: '#fff' }}>
                  <div style={{ height: 1, background: '#d2d9e5' }} />
                  {/* competencia-titulo */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 16, paddingLeft: 16, paddingRight: 0, paddingBottom: 0,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 280, height: 24, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 8, borderRight: '1px solid #d2d9e5', flexShrink: 0 }}>
                        <CompColorIcon color={color} />
                        <span style={{ fontSize: 16, fontWeight: 500, color: '#232831', lineHeight: 1.5, whiteSpace: 'nowrap' }}>{codigo}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#232831', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titulo}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 32, minWidth: 44, padding: '4px 12px', borderRadius: 8, color: '#abb3c4', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {/* competencia-notas: disabled pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: 4, justifyContent: 'space-between', padding: '16px 12px' }}>
                    {PILL_VALUES.map(val => (
                      <div key={val} style={{
                        height: 32, padding: '0 12px', borderRadius: 9999,
                        border: '1px solid #d2d9e5', background: '#f5f7fa',
                        color: '#abb3c4', fontSize: 14, fontWeight: 500,
                        display: 'inline-flex', alignItems: 'center',
                      }}>
                        {val === 0 ? 'Zero' : val}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* "Anular ou zerar" section */}
            <div style={{ height: 1, background: '#d2d9e5' }} />
            <div style={{ background: '#f5f7fa', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#232831' }}>Anular ou zerar redação</span>
              <button style={{
                alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center',
                height: 32, padding: '0 14px', borderRadius: 20,
                border: '1px solid #d2d9e5', background: '#fff',
                fontSize: 13, fontWeight: 500, color: '#626c80', cursor: 'pointer',
              }}>
                Escolher motivo
              </button>
            </div>
          </div>
        ) : panelTab === 'nota' ? (
          <NotaTab rascunho={rascunho} notas={notas} onNotaChange={onNotaChange} />
        ) : (
          <ComentariosTab
            rascunho={rascunho}
            comentarios={comentarios}
            comentarioGeral={comentarioGeral}
            onComentarioChange={onComentarioChange}
            onComentarioGeralChange={onComentarioGeralChange}
          />
        )}
      </div>

      {/* ── Validate button removed — professor validates via "Liberar notas" ── */}
      {false && hasRascunho && (
        <div style={{ padding: '12px 24px', borderTop: '1px solid #d2d9e5', flexShrink: 0 }}>
          <button
            onClick={onValidar}
            disabled={validating}
            style={{
              width: '100%', height: 40,
              borderRadius: 8, border: 'none',
              background: validating ? '#d2d9e5' : AI_GRADIENT,
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: validating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: validating ? 0.7 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {validating
              ? 'Validando…'
              : <><AISparkle size={14} color="#fff" /> Validar correção</>
            }
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function CorrecaoFilterBar({
  filteredQueue,
  currentIdx,
  filterTurma,
  filterStatus,
  turmas,
  onCurrentIdxChange,
  onFilterTurmaChange,
  onFilterStatusChange,
}: {
  filteredQueue: QueueItem[]
  currentIdx: number
  filterTurma: string
  filterStatus: string
  turmas: [string, string][]
  onCurrentIdxChange: (i: number) => void
  onFilterTurmaChange: (t: string) => void
  onFilterStatusChange: (s: string) => void
}) {
  const current = filteredQueue[currentIdx]

  const selectStyle: React.CSSProperties = {
    height: 32, padding: '0 8px',
    borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', color: '#232831',
    fontSize: 13, fontWeight: 500,
    cursor: 'pointer', outline: 'none',
  }

  const navBtn: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0',
    background: '#fff', color: '#626c80', fontSize: 15,
    cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px', flexShrink: 0,
      background: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border-secondary)',
    }}>
      {/* Aluno */}
      <select
        value={current?.id ?? ''}
        onChange={e => {
          const idx = filteredQueue.findIndex(r => r.id === e.target.value)
          if (idx >= 0) onCurrentIdxChange(idx)
        }}
        style={{ ...selectStyle, maxWidth: 160 }}
      >
        {filteredQueue.map(r => (
          <option key={r.id} value={r.id}>
            {r.aluno?.nome ?? r.alunoId}
          </option>
        ))}
      </select>

      {/* Turma */}
      <select
        value={filterTurma}
        onChange={e => { onFilterTurmaChange(e.target.value); onCurrentIdxChange(0) }}
        style={selectStyle}
      >
        <option value="todas">Todas as turmas</option>
        {turmas.map(([id, nome]) => (
          <option key={id} value={id}>{nome}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={filterStatus}
        onChange={e => onFilterStatusChange(e.target.value)}
        style={selectStyle}
      >
        <option value="aguardando_liberacao">Não liberadas</option>
        <option value="todas">Todas</option>
      </select>

      <div style={{ flex: 1 }} />

      {/* Pagination */}
      <button
        onClick={() => onCurrentIdxChange(Math.max(0, currentIdx - 1))}
        disabled={currentIdx === 0}
        style={{ ...navBtn, opacity: currentIdx === 0 ? 0.4 : 1 }}
      >
        ‹
      </button>
      <span style={{ fontSize: 13, color: '#626c80', minWidth: 52, textAlign: 'center' }}>
        {filteredQueue.length === 0 ? '— de —' : `${currentIdx + 1} de ${filteredQueue.length}`}
      </span>
      <button
        onClick={() => onCurrentIdxChange(Math.min(filteredQueue.length - 1, currentIdx + 1))}
        disabled={currentIdx >= filteredQueue.length - 1}
        style={{ ...navBtn, opacity: currentIdx >= filteredQueue.length - 1 ? 0.4 : 1 }}
      >
        ›
      </button>
    </div>
  )
}

// ─── Tab Empty View ───────────────────────────────────────────────────────────

function TabEmptyView({ tipo, motivo }: { tipo: 'correcao' | 'resultados'; motivo: 'oculto' | 'descartada' }) {
  const configs = {
    correcao: {
      oculto:     { titulo: 'Proposta ainda não publicada',    descricao: 'As redações aparecerão aqui quando os alunos puderem entregar.' },
      descartada: { titulo: 'Proposta descartada',             descricao: 'Propostas descartadas não recebem redações.' },
    },
    resultados: {
      oculto:     { titulo: 'Proposta ainda não publicada',    descricao: 'Os resultados estarão disponíveis após a data agendada.' },
      descartada: { titulo: 'Proposta descartada',             descricao: 'Propostas descartadas não têm resultados para exibir.' },
    },
  }
  const { titulo, descricao } = configs[tipo][motivo]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 32 }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--border-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color: 'var(--text-caption)',
      }}>
        {motivo === 'descartada' ? '✕' : '◷'}
      </div>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--text-body)' }}>{titulo}</p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-caption)', lineHeight: 1.5 }}>{descricao}</p>
      </div>
    </div>
  )
}

// ─── Aba Correção ─────────────────────────────────────────────────────────────

function AbaCorrecao({ propostaId }: { propostaId: string }) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [rascunho, setRascunho] = useState<CorrecaoRascunho | null>(null)
  const [notas, setNotas] = useState<Record<string, number>>({})
  const [comentarios, setComentarios] = useState<Record<string, string>>({})
  const [comentarioGeral, setComentarioGeral] = useState('')
  const [zoom, setZoom] = useState(100)
  const [activeTool, setActiveTool] = useState<Tool>('cursor')
  const [panelTab, setPanelTab] = useState<PanelTab>('nota')
  const [validating, setValidating] = useState(false)
  const [queueLoading, setQueueLoading] = useState(true)
  const [rascunhoLoading, setRascunhoLoading] = useState(false)
  const [filterTurma, setFilterTurma] = useState('todas')
  const [filterStatus, setFilterStatus] = useState<'aguardando_liberacao' | 'todas'>('aguardando_liberacao')

  // Load queue
  useEffect(() => {
    setQueueLoading(true)
    const url = filterStatus === 'todas'
      ? `/api/redacoes?propostaId=${propostaId}`
      : `/api/redacoes?propostaId=${propostaId}&status=${filterStatus}`
    fetch(url)
      .then(r => r.ok ? r.json() : [])
      .then((data: QueueItem[]) => {
        setQueue(data)
        setCurrentIdx(0)
      })
      .catch(() => setQueue([]))
      .finally(() => setQueueLoading(false))
  }, [propostaId, filterStatus])

  // Filtered queue
  const filteredQueue = filterTurma === 'todas'
    ? queue
    : queue.filter(r => r.turmaId === filterTurma)

  const current = filteredQueue[currentIdx] ?? null

  // Load rascunho when current changes
  useEffect(() => {
    if (!current) {
      setRascunho(null)
      setNotas({})
      setComentarios({})
      setComentarioGeral('')
      return
    }
    setRascunhoLoading(true)
    setRascunho(null)
    fetch(`/api/redacoes/${current.id}/correcao_rascunho`)
      .then(r => r.ok ? r.json() : null)
      .then((data: CorrecaoRascunho | null) => {
        if (data) {
          setRascunho(data)
          const ns: Record<string, number> = {}
          const cs: Record<string, string> = {}
          data.competencias.forEach((c: CompetenciaCorrecao) => {
            ns[c.codigo] = c.nota
            cs[c.codigo] = c.comentario
          })
          setNotas(ns)
          setComentarios(cs)
          setComentarioGeral(data.comentarioGeral)
        }
      })
      .catch(() => setRascunho(null))
      .finally(() => setRascunhoLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id])

  const notaFinal = Object.values(notas).reduce((a, b) => a + b, 0)

  // Unique turmas in full queue
  const turmas: [string, string][] = Array.from(
    new Map(queue.map(r => [r.turmaId, r.turma?.nome ?? r.turmaId])).entries()
  )

  const handleValidar = async () => {
    if (!current || !rascunho || validating) return
    setValidating(true)
    try {
      const ajustes = rascunho.competencias.map(c => ({
        competenciaCodigo: c.codigo,
        notaAjustada: notas[c.codigo],
        comentarioAdicional: comentarios[c.codigo] !== c.comentario
          ? comentarios[c.codigo] : undefined,
      }))
      await fetch(`/api/redacoes/${current.id}/liberacao`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professorId: 'prof-1', ajustes, comentarioGeral }),
      })
      // Remove validated item from queue and stay at current index (next item slides in)
      setQueue(prev => prev.filter(r => r.id !== current.id))
      setCurrentIdx(prev => Math.max(0, Math.min(prev, filteredQueue.length - 2)))
    } finally {
      setValidating(false)
    }
  }

  if (queueLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-caption)', fontSize: 13 }}>
        Carregando fila de validação…
      </div>
    )
  }

  if (filteredQueue.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
        <div style={{ fontSize: 36 }}>📭</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)' }}>Nenhuma redação enviada</div>
        <div style={{ fontSize: 14, color: 'var(--text-caption)' }}>Os alunos ainda não enviaram redações para esta proposta.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Filter bar */}
      <CorrecaoFilterBar
        filteredQueue={filteredQueue}
        currentIdx={currentIdx}
        filterTurma={filterTurma}
        filterStatus={filterStatus}
        turmas={turmas}
        onCurrentIdxChange={setCurrentIdx}
        onFilterTurmaChange={setFilterTurma}
        onFilterStatusChange={v => { setFilterStatus(v as 'aguardando_liberacao' | 'todas'); setCurrentIdx(0) }}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Annotation toolbar */}
        <AnnotationToolbar activeTool={activeTool} onToolChange={setActiveTool} />

        {/* Essay area */}
        <div style={{
          flex: 1, overflow: 'auto',
          background: '#dde2ea',
          position: 'relative',
          display: 'flex', justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '32px 24px 64px',
        }}>
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
            <EssayPaper />
          </div>

          {/* Zoom control — bottom-left */}
          <div style={{
            position: 'sticky', bottom: 16,
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#fff', borderRadius: 8,
            boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
            padding: '4px 8px',
            alignSelf: 'flex-end',
            marginLeft: 0,
            flexShrink: 0,
          }}>
            <button
              onClick={() => setZoom(z => Math.max(50, z - 25))}
              style={{ ...iconBtn, color: '#626c80', fontSize: 18, fontWeight: 300 }}
            >−</button>
            <span style={{ fontSize: 12, color: '#626c80', minWidth: 38, textAlign: 'center' }}>{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(200, z + 25))}
              style={{ ...iconBtn, color: '#626c80', fontSize: 18, fontWeight: 300 }}
            >+</button>
          </div>
        </div>

        {/* Right panel */}
        <RightPanel
          notaFinal={notaFinal}
          rascunho={rascunho}
          notas={notas}
          comentarios={comentarios}
          comentarioGeral={comentarioGeral}
          panelTab={panelTab}
          validating={validating}
          rascunhoLoading={rascunhoLoading}
          onNotaChange={(codigo, nota) => setNotas(prev => ({ ...prev, [codigo]: nota }))}
          onComentarioChange={(codigo, text) => setComentarios(prev => ({ ...prev, [codigo]: text }))}
          onComentarioGeralChange={setComentarioGeral}
          onPanelTabChange={setPanelTab}
          onValidar={handleValidar}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA RESULTADOS
// ═══════════════════════════════════════════════════════════════════════════════

interface ResultadosData {
  participacao: { total: number; submetidas: number; comScore: number; percentual: number }
  desempenhoMedio: number
  competencias: { codigo: string; titulo: string; notaMedia: number; tag: 'Desafiar' | 'Acompanhar' | 'Intervir' }[]
  histogramaFinal: { faixa: string; count: number }[]
  histogramaCompetencias: Record<string, { faixa: string; count: number }[]>
  alunos: {
    id: string; nome: string; turma: string; status: string
    notaFinal: number | null; competencias: Record<string, number> | null
  }[]
}

// ─── Tag chip ─────────────────────────────────────────────────────────────────

const TAG_STYLES = {
  Desafiar:   { bg: '#dcfce7', color: '#0c7742' },
  Acompanhar: { bg: '#fef3c7', color: '#92400e' },
  Intervir:   { bg: '#fee2e2', color: '#dc2626' },
} as const

function TagChip({ tag }: { tag: 'Desafiar' | 'Acompanhar' | 'Intervir' }) {
  const s = TAG_STYLES[tag]
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 12,
      fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {tag}
    </span>
  )
}

// ─── Mini nota bar (table) ────────────────────────────────────────────────────

function NotaBar({ nota }: { nota: number }) {
  const pct = (nota / 1000) * 100
  const color = pct >= 80 ? '#0c7742' : pct >= 60 ? '#0079ce' : '#e07b00'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#232831', minWidth: 32, textAlign: 'right' }}>{nota}</span>
    </div>
  )
}

// ─── Histogram bar chart ──────────────────────────────────────────────────────

function Histogram({ data, color = '#0079ce' }: { data: { faixa: string; count: number }[]; color?: string }) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const BAR_MAX = 96

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: BAR_MAX + 44, overflow: 'hidden' }}>
      {data.map(d => (
        <div key={d.faixa} style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: d.count > 0 ? '#232831' : 'transparent', minHeight: 16 }}>
            {d.count}
          </span>
          <div style={{
            width: '100%',
            height: d.count > 0 ? Math.max((d.count / maxCount) * BAR_MAX, 6) : 0,
            background: color,
            borderRadius: '3px 3px 0 0',
            transition: 'height 0.3s',
          }} />
          <div style={{ width: '100%', height: 1, background: '#e5e7eb' }} />
          <span style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
            {d.faixa}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Status badge for table ───────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  corrigida:             { label: 'Corrigida',    color: '#0c7742' },
  aguardando_liberacao:  { label: 'Em liberação', color: '#0079ce' },
  corrigindo:            { label: 'Corrigindo',   color: '#0079ce' },
  enviada:               { label: 'Enviada',      color: '#626c80' },
  rejeitada:             { label: 'Rejeitada',    color: '#dc2626' },
  ilegivel:              { label: 'Ilegível',     color: '#e07b00' },
  pendente_envio:        { label: 'Não entregou', color: '#94a3b8' },
}

// ─── Aba Resultados ───────────────────────────────────────────────────────────

function AbaResultados({ propostaId }: { propostaId: string }) {
  const [data, setData] = useState<ResultadosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedComp, setSelectedComp] = useState('C1')

  useEffect(() => {
    fetch(`/api/propostas/${propostaId}/resultados`)
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [propostaId])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-caption)', fontSize: 13 }}>
        Carregando resultados…
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-caption)', fontSize: 13 }}>
        Resultados não disponíveis.
      </div>
    )
  }

  // Filtro de busca
  const alunosFiltrados = data.alunos.filter(a =>
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    a.turma.toLowerCase().includes(search.toLowerCase())
  )

  const sectionTitle: React.CSSProperties = {
    fontSize: 14, fontWeight: 600, color: '#626c80',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    margin: '0 0 12px',
  }

  const card: React.CSSProperties = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-secondary)',
    borderRadius: 12, padding: '20px 24px',
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-secondary)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 64px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── 1. Cards de resumo ──────────────────────────────────────────── */}
        <section>
          <p style={sectionTitle}>Resumo</p>
          <div style={{ display: 'flex', gap: 16 }}>

            {/* Participação */}
            <div style={{ ...card, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#626c80', marginBottom: 8 }}>Participação</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#232831', lineHeight: 1, marginBottom: 4 }}>
                {data.participacao.percentual}%
              </div>
              <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${data.participacao.percentual}%`, background: '#0079ce', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 13, color: '#626c80' }}>
                {data.participacao.submetidas} de {data.participacao.total} estudantes participaram
              </div>
            </div>

            {/* Desempenho médio */}
            <div style={{ ...card, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#626c80', marginBottom: 8 }}>Desempenho médio</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#232831', lineHeight: 1, marginBottom: 4 }}>
                {data.desempenhoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
                <span style={{ fontSize: 16, fontWeight: 400, color: '#94a3b8' }}> / 1.000</span>
              </div>
              <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  height: '100%',
                  width: `${(data.desempenhoMedio / 1000) * 100}%`,
                  background: data.desempenhoMedio >= 800 ? '#0c7742' : data.desempenhoMedio >= 600 ? '#0079ce' : '#e07b00',
                  borderRadius: 3,
                }} />
              </div>
              <div style={{ fontSize: 13, color: '#626c80' }}>
                Baseado em {data.participacao.comScore} redações corrigidas
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Resultado por competência ────────────────────────────────── */}
        <section>
          <p style={sectionTitle}>Resultado por competência</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {data.competencias.map(comp => (
              <div key={comp.codigo} style={{ ...card, flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>{comp.codigo}</div>
                <div style={{
                  fontSize: 12, color: '#475569', marginBottom: 10,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4,
                }}>
                  {comp.titulo}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#232831', marginBottom: 8, lineHeight: 1 }}>
                  {comp.notaMedia.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}> /200</span>
                </div>
                <TagChip tag={comp.tag} />
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Gráficos de distribuição ──────────────────────────────────── */}
        <section>
          <p style={sectionTitle}>Distribuição</p>
          <div style={{ display: 'flex', gap: 16 }}>

            {/* Nota final */}
            <div style={{ ...card, flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#232831', marginBottom: 16 }}>
                Nota final
              </div>
              <Histogram data={data.histogramaFinal} color="#0079ce" />
            </div>

            {/* Por competência */}
            <div style={{ ...card, flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#232831' }}>Por competência</div>
                <select
                  value={selectedComp}
                  onChange={e => setSelectedComp(e.target.value)}
                  style={{
                    height: 28, padding: '0 8px', borderRadius: 6,
                    border: '1px solid #e2e8f0', background: '#fff',
                    color: '#232831', fontSize: 12, fontWeight: 500, cursor: 'pointer', outline: 'none',
                  }}
                >
                  {data.competencias.map(c => (
                    <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.titulo}</option>
                  ))}
                </select>
              </div>
              <Histogram
                data={data.histogramaCompetencias[selectedComp] ?? []}
                color={TAG_STYLES[data.competencias.find(c => c.codigo === selectedComp)?.tag ?? 'Acompanhar'].color}
              />
            </div>
          </div>
        </section>

        {/* ── 4. Tabela de alunos ──────────────────────────────────────────── */}
        <section>
          <p style={sectionTitle}>Estudantes</p>

          {/* Search + referência */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar estudante ou turma"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', height: 36, paddingLeft: 32, paddingRight: 12,
                  borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#232831', fontSize: 13,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ fontSize: 13, color: '#626c80' }}>
              Desempenho médio:{' '}
              <strong style={{ color: '#232831' }}>
                {data.desempenhoMedio.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
              </strong>
            </div>
          </div>

          {/* Table */}
          <div style={{ ...card, padding: 0, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                  {['Nome', 'Turma', 'Nota final', 'C1', 'C2', 'C3', 'C4', 'C5'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: i === 0 ? 'left' : i <= 2 ? 'left' : 'center',
                      fontSize: 11, fontWeight: 600, color: '#626c80',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados.map((aluno, idx) => {
                  const statusInfo = STATUS_LABELS[aluno.status] ?? { label: aluno.status, color: '#94a3b8' }
                  return (
                    <tr
                      key={aluno.id}
                      style={{ borderBottom: idx < alunosFiltrados.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                    >
                      {/* Nome */}
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#232831', whiteSpace: 'nowrap' }}>
                        {aluno.nome}
                      </td>
                      {/* Turma */}
                      <td style={{ padding: '12px 16px', color: '#626c80', whiteSpace: 'nowrap' }}>
                        {aluno.turma}
                      </td>
                      {/* Nota final */}
                      <td style={{ padding: '12px 16px', minWidth: 140 }}>
                        {aluno.notaFinal !== null
                          ? <NotaBar nota={aluno.notaFinal} />
                          : <span style={{ fontSize: 12, color: statusInfo.color, fontWeight: 500 }}>{statusInfo.label}</span>
                        }
                      </td>
                      {/* C1–C5 */}
                      {['C1','C2','C3','C4','C5'].map(cod => {
                        const v = aluno.competencias?.[cod] ?? null
                        const color = v === null ? '#94a3b8' : v >= 160 ? '#0c7742' : v >= 80 ? '#0079ce' : '#dc2626'
                        return (
                          <td key={cod} style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color }}>
                              {v ?? '—'}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
                {alunosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      Nenhum estudante encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  )
}

// ─── Inner page (uses useSearchParams) ───────────────────────────────────────

function PropostaDetalheInner() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const marcaConfig = useMarca()

  const aba = (searchParams.get('aba') as Aba) || 'proposta'
  const [subItem, setSubItem] = useState<SubItem>('manual-pedagogico')
  const [proposta, setProposta] = useState<PropostaAPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [temPendentes, setTemPendentes] = useState(false)
  const [liberando, setLiberando] = useState(false)

  useEffect(() => {
    fetch(`/api/propostas/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setProposta)
      .catch(() => setProposta(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetch(`/api/redacoes?propostaId=${id}&status=aguardando_liberacao`)
      .then(r => r.ok ? r.json() : [])
      .then((data: { id: string }[]) => setTemPendentes(data.length > 0))
      .catch(() => setTemPendentes(false))
  }, [id])

  const handleLiberarNotas = async () => {
    if (liberando) return
    setLiberando(true)
    try {
      await fetch(`/api/propostas/${id}/liberar-notas`, { method: 'POST' })
      setTemPendentes(false)
    } finally {
      setLiberando(false)
    }
  }

  const goToAba = (next: Aba) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'proposta') params.delete('aba')
    else params.set('aba', next)
    const qs = params.toString()
    router.replace(`/professor/propostas/${id}${qs ? '?' + qs : ''}`)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-caption)', fontSize: 'var(--font-size-sm)' }}>
        Carregando…
      </div>
    )
  }

  if (!proposta) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
        <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-caption)' }}>Proposta não encontrada.</div>
        <Link href="/professor/propostas" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-active)' }}>
          ← Voltar para propostas
        </Link>
      </div>
    )
  }

  // ── Status de inatividade ────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().split('T')[0]
  const motivoInativo: 'descartada' | 'oculto' | null =
    proposta.status === 'descartada' ? 'descartada'
    : proposta.dataAgendada > todayStr ? 'oculto'
    : null

  // ── Content by sub-item ──────────────────────────────────────────────────────

  const renderSubContent = () => {
    const pdfSrc = PDF_SOURCES[subItem]

    if (subItem === 'material-apoio') {
      const videoSrc = VIDEO_SOURCES[subItem]
      return videoSrc ? <VimeoPlayer src={videoSrc} /> : <MockVideoPlayer />
    }

    if (pdfSrc) return <RealPDFViewer src={pdfSrc} />

    switch (subItem) {
      case 'manual-pedagogico': return <MockPDFViewer content="manual" />
      case 'proposta-docente':  return <MockPDFViewer content="enem" />
      default:                  return <MockPDFViewer content="manual" />
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflow: 'hidden',
      background: 'var(--bg-secondary)',
    }}>
      {/* ── Header — 1 linha, 3 colunas ─────────────────────────────────────── */}
      <div style={{
        height: 56, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-secondary)',
        paddingLeft: 8, paddingRight: 16, gap: 16,
      }}>
        {/* Col esquerda: ← + título truncado (flex: 1) */}
        <div style={{
          flex: 1, minWidth: 140,
          display: 'flex', alignItems: 'center', height: '100%',
          position: 'relative', overflow: 'hidden',
        }}>
          <button onClick={() => router.back()} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 44, height: 44, borderRadius: 8, flexShrink: 0,
            color: 'var(--text-body)', background: 'transparent', border: 'none',
            fontSize: 18, cursor: 'pointer',
          }}>
            ←
          </button>
          <span style={{
            flex: 1, minWidth: 0,
            paddingLeft: 16,
            fontSize: 18, fontWeight: 500, color: '#232831',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {proposta.titulo}
          </span>
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 40,
            background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.98))',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Col central: tabs (shrink-0, alinhadas à base) */}
        <div style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'flex-end', height: '100%',
        }}>
          <TabButton label="Proposta"   active={aba === 'proposta'}   onClick={() => goToAba('proposta')} />
          <TabButton label="Correção"   active={aba === 'correcao'}   onClick={() => goToAba('correcao')} />
          <TabButton label="Resultados" active={aba === 'resultados'} onClick={() => goToAba('resultados')} />
        </div>

        {/* Col direita: ações (flex: 1) */}
        <div style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          {temPendentes && (
            <button
              onClick={handleLiberarNotas}
              disabled={liberando}
              style={{
                background: liberando ? '#5baee0' : '#0079ce',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14,
                fontWeight: 500,
                cursor: liberando ? 'not-allowed' : 'pointer',
                minHeight: 32,
                whiteSpace: 'nowrap',
                lineHeight: 1.5,
                transition: 'background 0.15s',
              }}
            >
              {liberando ? 'Liberando…' : 'Liberar notas'}
            </button>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>

        {/* Aba Proposta */}
        {aba === 'proposta' && (
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{
              width: 220, flexShrink: 0,
              borderRight: '1px solid var(--border-secondary)',
              background: 'var(--bg-primary)',
              padding: 32,
              overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: 32,
            }}>
              <StatusIndicator dataAgendada={proposta.dataAgendada} status={proposta.status} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <SidebarGroupLabel>Para o docente</SidebarGroupLabel>
                <SidebarItem label={marcaConfig.itensProposta.professor[0]?.label ?? 'Manual pedagógico'}  active={subItem === 'manual-pedagogico'} onClick={() => setSubItem('manual-pedagogico')} />
                <SidebarItem label={marcaConfig.itensProposta.professor[1]?.label ?? 'Proposta de redação'} active={subItem === 'proposta-docente'}  onClick={() => setSubItem('proposta-docente')} />
                <SidebarGroupLabel>Para o estudante</SidebarGroupLabel>
                <SidebarItem label={marcaConfig.itensProposta.estudante[0]?.label ?? 'Material de apoio'}  active={subItem === 'material-apoio'}     onClick={() => setSubItem('material-apoio')} />
                <SidebarItem label={marcaConfig.itensProposta.estudante[1]?.label ?? 'Proposta de redação'} active={subItem === 'proposta-estudante'} onClick={() => setSubItem('proposta-estudante')} />
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {renderSubContent()}
            </div>
          </div>
        )}

        {/* Aba Correção */}
        {aba === 'correcao' && (
          motivoInativo
            ? <TabEmptyView tipo="correcao" motivo={motivoInativo} />
            : <AbaCorrecao propostaId={id} />
        )}

        {/* Aba Resultados */}
        {aba === 'resultados' && (
          motivoInativo
            ? <TabEmptyView tipo="resultados" motivo={motivoInativo} />
            : <AbaResultados propostaId={id} />
        )}
      </div>
    </div>
  )
}

// ─── Default export ───────────────────────────────────────────────────────────

export default function PropostaDetalhePage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-caption)', fontSize: 'var(--font-size-sm)' }}>
        Carregando…
      </div>
    }>
      <PropostaDetalheInner />
    </Suspense>
  )
}
