'use client';

import { createContext, useContext } from 'react';
import { Marca, MarcaConfig } from '@/types/marca';
import { MARCAS, DEFAULT_MARCA } from '@/config/marcas';

// ── Context ───────────────────────────────────────────────────────────────────

const MarcaContext = createContext<MarcaConfig>(MARCAS[DEFAULT_MARCA]);

// ── Provider ──────────────────────────────────────────────────────────────────

interface MarcaProviderProps {
  marca: Marca;
  children: React.ReactNode;
}

export function MarcaProvider({ marca, children }: MarcaProviderProps) {
  const config = MARCAS[marca] ?? MARCAS[DEFAULT_MARCA];
  return (
    <MarcaContext.Provider value={config}>
      {children}
    </MarcaContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMarca(): MarcaConfig {
  return useContext(MarcaContext);
}
