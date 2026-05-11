export type Persona = 'gestor' | 'professor' | 'aluno';

export type ModoCorrecao = 'ia_pura' | 'hibrido';

export type StatusProposta = 'agendada' | 'ativa' | 'encerrada' | 'descartada';

export type StatusRedacao =
  | 'pendente_envio'
  | 'enviada'
  | 'corrigindo'
  | 'aguardando_liberacao'
  | 'corrigida'
  | 'rejeitada'
  | 'ilegivel';

export type TagDesempenho = 'Desafiar' | 'Acompanhar' | 'Intervir';

export interface Escola {
  id: string;
  nome: string;
}

export interface Turma {
  id: string;
  nome: string;
  escolaId: string;
  professorId: string;
  modoCorrecao: ModoCorrecao;
  frequencia?: string;
}

export interface Professor {
  id: string;
  nome: string;
  escolaId: string;
}

export interface Aluno {
  id: string;
  nome: string;
  turmaId: string;
}

export interface Colecao {
  id: string;
  nome: string;
  cor: string; // hex
}

export interface Proposta {
  id: string;
  titulo: string;
  colecaoId: string;
  dataAgendada: string; // ISO date
  dataVisivel?: string;
  status: StatusProposta;
  imageUrl?: string;
  turmaIds: string[];
}

export interface Redacao {
  id: string;
  alunoId: string;
  propostaId: string;
  turmaId: string;
  status: StatusRedacao;
  dataEnvio?: string; // ISO
  arquivoUrl?: string;
  modoCorrecaoAplicado: ModoCorrecao;
  notaFinal?: number;
  C1?: number;
  C2?: number;
  C3?: number;
  C4?: number;
  C5?: number;
}

export interface CompetenciaCorrecao {
  codigo: 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
  titulo: string;
  nota: number; // 0, 40, 80, 120, 160, 200
  comentario: string;
}

export interface CorrecaoRascunho {
  id: string;
  redacaoId: string;
  notaFinal: number;
  competencias: CompetenciaCorrecao[];
  comentarioGeral: string;
  geradoEm: string;
}

export interface AjusteLiberacao {
  competenciaCodigo: string;
  notaAjustada?: number;
  comentarioAdicional?: string;
}

export interface Liberacao {
  id: string;
  redacaoId: string;
  professorId: string;
  ajustes: AjusteLiberacao[];
  comentarioGeral?: string;
  liberadoEm: string;
}

export interface ComentarioAnnotation {
  id: string;
  texto: string;
  competenciaCodigo?: string; // undefined = comentário geral
}

export interface Devolutiva {
  id: string;
  redacaoId: string;
  notaFinal: number;
  competencias: CompetenciaCorrecao[];
  comentarioGeral: string;
  comentarios: ComentarioAnnotation[];
  planoDeAcao?: string;
  disponivelEm: string;
}

export interface PontoEvolucao {
  data: string; // ISO date
  notaFinal: number;
  competencias: Record<string, number>;
}

export interface EvolucaoAluno {
  alunoId: string;
  historico: PontoEvolucao[];
}

export interface ConfiguracaoLab {
  turmaId: string;
  modoCorrecao: ModoCorrecao;
  liberacaoAutomaticaPropostas: boolean;
  liberacaoAutomaticaDevolutivas: boolean;
  autonomiaAluno: boolean;
  liberacaoGradual: boolean;
}

export interface AgendaConfig {
  turmaId: string;
  liberacaoGradual: boolean;
  autonomiaAluno: boolean;
}

export interface Mensagem {
  id: string;
  redacaoId: string;
  alunoId: string;
  texto: string;
  criadoEm: string;
}

export interface LatenciaConfig {
  aiMs: number;
  feedbackEtaHoras: number;
}

// API response shapes
export interface HomeStatus {
  atrasadas: number;
  pendentes: number;
  corrigidas: number;
  rejeitadas: number;
}

export interface PropostaComColecao extends Proposta {
  colecao: Colecao;
}

export interface RedacaoComDetalhes extends Redacao {
  aluno: Aluno;
  proposta: Proposta;
  turma: Turma;
}
