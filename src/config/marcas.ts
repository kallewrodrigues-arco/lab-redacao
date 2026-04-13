import { Marca, MarcaConfig } from '@/types/marca';

export const MARCAS: Record<Marca, MarcaConfig> = {
  sas: {
    id: 'sas',
    nomeExibicao: 'SAS',
    logoSrc: '/logos/sas.svg',
    logoWidth: 73,
    logoHeight: 32,
    corPrimaria: '#0D4AD6',
    corPrimariaHover: '#0035B2',
    nomeColecaoPratique: 'Pratique Redação',
    imagemColecaoPratique: '/images/pratique-redacao.jpg',
    itensProposta: {
      professor: [
        { label: 'Material de apoio (vídeo)', tipo: 'video' },
        { label: 'Proposta de redação', tipo: 'proposta' },
      ],
      estudante: [
        { label: 'Material de apoio (vídeo)', tipo: 'video' },
        { label: 'Proposta de redação', tipo: 'proposta' },
      ],
    },
  },
  coc: {
    id: 'coc',
    nomeExibicao: 'COC',
    logoSrc: '/logos/coc.svg',
    logoWidth: 114,
    logoHeight: 32,
    corPrimaria: '#007724',
    corPrimariaHover: '#035816',
    nomeColecaoPratique: 'Laboratório de Redação',
    imagemColecaoPratique: '/images/lab-redacao-coc.jpg',
    itensProposta: {
      professor: [
        { label: 'Manual pedagógico', tipo: 'manual' },
        { label: 'Proposta de redação', tipo: 'proposta' },
      ],
      estudante: [
        { label: 'Material de apoio (vídeo)', tipo: 'video' },
        { label: 'Proposta de redação', tipo: 'proposta' },
      ],
    },
  },
};

export const DEFAULT_MARCA: Marca = 'sas';
