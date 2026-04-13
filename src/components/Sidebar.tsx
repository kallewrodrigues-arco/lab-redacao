'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';

export type Persona = 'gestor' | 'professor' | 'aluno';

interface SidebarProps {
  persona: Persona;
}

// Fixed nav items — identical across all personas and brands
const NAV_ITEMS = [
  { id: 'inicio',     label: 'Início',       segment: '',           icon: 'home'      },
  { id: 'turmas',     label: 'Sala de aula', segment: '/turmas',    icon: 'classroom' },
  { id: 'atividades', label: 'Atividades',   segment: '/propostas', icon: 'activity'  },
  { id: 'relatorios', label: 'Relatórios',   segment: '/relatorios',icon: 'chart'     },
  { id: 'recursos',   label: 'Recursos',     segment: '/recursos',  icon: 'resources' },
  { id: 'gestao',     label: 'Gestão',       segment: '/configurar',icon: 'gestao'    },
] as const;

// ── Icons (16×16 SVG, inline) ─────────────────────────────────────────────────

function IconHome() {
  // House shape — uses brand CSS variables for fill/stroke
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {/* roof */}
      <path
        d="M1.4 8L8 1.4 14.6 8"
        stroke="var(--sidebar-home-stroke)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* body */}
      <path
        d="M3 7.2V13.6a.4.4 0 00.4.4H6.4V10.4h3.2V14h3a.4.4 0 00.4-.4V7.2"
        fill="var(--sidebar-home-fill)"
        stroke="var(--sidebar-home-stroke)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClassroom() {
  // Monitor / screen icon
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.4" y="2.4" width="13.2" height="8.8" rx="1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5.6 14.4h4.8M8 11.2v3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconActivity() {
  // Waveform / heartbeat line
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1.4 8h2.4l2-5.2 3.2 10.4 2-5.2H14.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChart() {
  // Bar chart
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.4 13.6V7.2M5.6 13.6V4.8M8.8 13.6V8.8M12 13.6V2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconResources() {
  // Two rectangles / books
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.4" y="2.4" width="5.6" height="11.2" rx="0.8" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="2.4" width="5.6" height="11.2" rx="0.8" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}

function IconGestao() {
  // Briefcase — solid fill
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.6 4V3.2a1.6 1.6 0 013.2 0V4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <rect x="1.4" y="4" width="13.2" height="9.6" rx="1.2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.4 7.6h13.2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6.4 7.6v1.6h3.2V7.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCollapse({ collapsed }: { collapsed: boolean }) {
  return collapsed ? (
    // Chevron right (expand)
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="0.8" y="0.8" width="14.4" height="14.4" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 2v12" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M9.6 6.4L11.2 8l-1.6 1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : (
    // Chevron left (collapse)
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="0.8" y="0.8" width="14.4" height="14.4" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6 2v12" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M3.6 6.4L2 8l1.6 1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const ICON_MAP: Record<string, React.ReactElement> = {
  home:      <IconHome />,
  classroom: <IconClassroom />,
  activity:  <IconActivity />,
  chart:     <IconChart />,
  resources: <IconResources />,
  gestao:    <IconGestao />,
};

// ── Sidebar component ─────────────────────────────────────────────────────────

export default function Sidebar({ persona }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const baseHref = `/${persona}`;

  return (
    <nav
      style={{
        width: collapsed ? 56 : 240,
        minHeight: '100vh',
        background: '#ffffff',
        borderRight: '1px solid #ebeff7',
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '16px 8px' : '16px 14px',
        gap: 0,
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.2s ease, padding 0.2s ease',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          flexShrink: 0,
        }}
      >
        {!collapsed && <Logo scale={0.75} />}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 8,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#8c95a6',
            flexShrink: 0,
            padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f5f7fa')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <IconCollapse collapsed={collapsed} />
        </button>
      </div>

      {/* ── Gap between hero and nav ──────────────────────────────────────── */}
      <div style={{ height: 64, flexShrink: 0 }} />

      {/* ── Nav items ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const href = item.segment === ''
            ? baseHref
            : `${baseHref}${item.segment}`;

          const isActive = item.segment === ''
            ? pathname === baseHref
            : pathname.startsWith(href);

          const isHome = item.id === 'inicio';

          return (
            <Link
              key={item.id}
              href={href}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                height: 32,
                padding: collapsed ? '0' : '0 8px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isActive
                  ? 'var(--sidebar-item-active-text)'
                  : isHome
                    ? 'var(--sidebar-home-stroke)'
                    : '#232831',
                background: isActive ? 'var(--sidebar-item-active-bg)' : 'transparent',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = '#f5f7fa';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: isActive
                    ? 'var(--sidebar-item-active-text)'
                    : isHome
                      ? 'var(--sidebar-home-stroke)'
                      : '#626c80',
                }}
              >
                {ICON_MAP[item.icon] ?? null}
              </span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </div>

      {/* ── Back to persona selector ──────────────────────────────────────── */}
      <div style={{ flexShrink: 0, marginTop: 'auto', paddingTop: 8 }}>
        <Link
          href="/"
          title={collapsed ? 'Trocar persona' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            height: 32,
            padding: collapsed ? '0' : '0 8px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 13,
            color: '#8c95a6',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f5f7fa')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {collapsed ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L6 8l4 5M6 8h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            '← Trocar persona'
          )}
        </Link>
      </div>
    </nav>
  );
}
