'use client';

import { useState, useEffect } from 'react';

type TabId = 'visao-geral' | 'atividades' | 'resultados';

const TABS: { id: TabId; label: string; sectionId?: string }[] = [
  { id: 'visao-geral', label: 'Visão geral' },
  { id: 'atividades', label: 'Atividades', sectionId: 'section-atividades' },
  { id: 'resultados', label: 'Resultados', sectionId: 'section-resultados' },
];

const NAV_HEIGHT = 56;

export function NavTabs() {
  const [active, setActive] = useState<TabId>('visao-geral');

  function handleClick(tab: (typeof TABS)[0]) {
    setActive(tab.id);

    if (!tab.sectionId) {
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const el = document.getElementById(tab.sectionId);
    // scrollIntoView scrolls the nearest scrollable ancestor (<main>),
    // and scrollMarginTop on the element handles the sticky nav offset.
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Track active tab based on scroll inside <main>
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    function onScroll() {
      const buffer = NAV_HEIGHT + 16;
      const mainTop = main!.getBoundingClientRect().top;

      const sectionResultados = document.getElementById('section-resultados');
      const sectionAtividades = document.getElementById('section-atividades');

      const topOf = (el: HTMLElement) =>
        el.getBoundingClientRect().top - mainTop;

      if (sectionResultados && topOf(sectionResultados) <= buffer) {
        setActive('resultados');
      } else if (sectionAtividades && topOf(sectionAtividades) <= buffer) {
        setActive('atividades');
      } else {
        setActive('visao-geral');
      }
    }

    main.addEventListener('scroll', onScroll, { passive: true });
    return () => main.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'white',
      borderBottom: '1px solid #d2d9e5',
      width: '100%',
    }}>
    <div style={{
      maxWidth: 1042,
      margin: '0 auto',
      padding: '0 var(--space-700)',
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
      boxSizing: 'border-box',
    }}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleClick(tab)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: NAV_HEIGHT,
              padding: 12,
              borderRadius: '8px 8px 0 0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 500,
              color: isActive ? '#232831' : '#626c80',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
            {isActive && (
              <span style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: '#0079ce',
                borderRadius: '4px 4px 0 0',
              }} />
            )}
          </button>
        );
      })}
    </div>
    </div>
  );
}
