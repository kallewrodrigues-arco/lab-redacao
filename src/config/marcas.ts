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
    nomeOrganizacao: 'SAS Educação',
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
    pdfSources: {
      manualPedagogico:  null,
      propostaDocente:   null,
      propostaEstudante: '/pdfs/proposta-estudante-sas.pdf',
    },
    videoSources: {
      materialApoio: 'https://player.vimeo.com/video/1122031196?controls=1&transparent=0&dnt=1&api=1&playsinline=1&title=0&byline=0&portrait=0',
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
    nomeOrganizacao: 'COC',
    imagemColecaoPratique: '/images/lab-redacao.jpg',
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
    pdfSources: {
      manualPedagogico:  null,
      propostaDocente:   '/pdfs/proposta-docente-coc.pdf',
      propostaEstudante: '/pdfs/proposta-estudante-coc.pdf',
    },
    videoSources: {
      materialApoio: '/videos/repertorio-coc.mp4',
    },
  },
};

export const DEFAULT_MARCA: Marca = 'sas';
