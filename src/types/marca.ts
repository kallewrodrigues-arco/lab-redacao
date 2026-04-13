// ── Tipos de marca ────────────────────────────────────────────────────────────

export type Marca = 'sas' | 'coc';

export interface ItemProposta {
  label: string;
  tipo: 'video' | 'proposta' | 'manual';
}

export interface ItensProposta {
  professor: ItemProposta[];
  estudante: ItemProposta[];
}

export interface MarcaConfig {
  id: Marca;
  nomeExibicao: string;
  logoSrc: string;
  /** Largura nativa do SVG do logo em px */
  logoWidth: number;
  /** Altura nativa do SVG do logo em px */
  logoHeight: number;
  corPrimaria: string;
  corPrimariaHover: string;
  /** Nome da coleção "Pratique" para esta marca (ex: "Pratique Redação" | "Laboratório de Redação") */
  nomeColecaoPratique: string;
  /** Caminho da imagem do card da coleção Pratique/Lab no /public */
  imagemColecaoPratique: string;
  itensProposta: ItensProposta;
}
