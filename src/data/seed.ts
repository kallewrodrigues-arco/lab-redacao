import {
  Escola, Turma, Professor, Aluno, Colecao, Proposta, Redacao,
  CorrecaoRascunho, Liberacao, Devolutiva, EvolucaoAluno,
  ConfiguracaoLab, AgendaConfig, Mensagem, LatenciaConfig,
  ModoCorrecao
} from '@/types';

export interface Db {
  escolas: Escola[];
  turmas: Turma[];
  professores: Professor[];
  alunos: Aluno[];
  colecoes: Colecao[];
  propostas: Proposta[];
  redacoes: Redacao[];
  correcoes: CorrecaoRascunho[];
  liberacoes: Liberacao[];
  devolutivas: Devolutiva[];
  evolucoes: EvolucaoAluno[];
  configuracoes: ConfiguracaoLab[];
  agendasConfig: AgendaConfig[];
  mensagens: Mensagem[];
  latencia: LatenciaConfig;
}

const COMPETENCIAS_TITULOS: Record<string, string> = {
  C1: 'Dominar a escrita formal',
  C2: 'Compreender o tema',
  C3: 'Interpretar e organizar ideias',
  C4: 'Dominar a argumentação',
  C5: 'Propor solução respeitosa',
};

const COMENTARIOS_IA: Record<string, string[]> = {
  C1: [
    "O texto usa bem a norma padrão, mas há deslizes como 'cujas as condições precárias'. Esses erros pontuais afetam um pouco a clareza.",
    'A estrutura sintática é regular, com poucos desvios de registro e convenções da escrita.',
    'Há truncamentos no último parágrafo que prejudicam a fluidez. Orações isoladas por ponto final indevidamente.',
  ],
  C2: [
    'O texto apresenta uma estrutura sintática regular, mas há deslizes que reduzem a clareza.',
    'Compreensão sólida do tema com bom repertório sociocultural.',
    'O tema é abordado de forma tangencial; falta aprofundamento na argumentação central.',
  ],
  C3: [
    'Ideias bem organizadas, com progressão temática clara entre os parágrafos.',
    'A argumentação perde coesão no segundo parágrafo, onde há salto lógico.',
    'Boa organização estrutural, mas os conectivos de oposição estão subutilizados.',
  ],
  C4: [
    'Os argumentos são pertinentes, mas carecem de aprofundamento e evidências concretas.',
    'Argumentação coesa com dados e exemplos bem articulados.',
    'A linha argumentativa se fragmenta no penúltimo parágrafo, enfraquecendo a conclusão.',
  ],
  C5: [
    'A proposta de intervenção é genérica. Falta especificar agentes, ações e meios.',
    'Proposta detalhada e exequível, com agentes claros e respeito aos direitos humanos.',
    'Intervenção citada, mas sem articulação com os argumentos desenvolvidos no texto.',
  ],
};

function randomComment(competencia: string): string {
  const opts = COMENTARIOS_IA[competencia] ?? ['Comentário não disponível.'];
  return opts[Math.floor(Math.random() * opts.length)];
}

function pickComment(competencia: string, idx: number): string {
  const opts = COMENTARIOS_IA[competencia] ?? ['Comentário não disponível.'];
  return opts[idx % opts.length];
}

// ─── Gerador de dados em lote ─────────────────────────────────────────────────

const NOTAS_POOL = [280, 320, 400, 440, 480, 520, 560, 600, 640, 680,
                    720, 760, 800, 840, 880, 920, 960, 1000];

const COMENTARIOS_GERAIS = [
  'Boa redação! Continue evoluindo a cada semana.',
  'Texto com argumentação sólida. Foque em detalhar a proposta de intervenção.',
  'Redação bem estruturada. Trabalhe os conectivos para melhorar a coesão.',
  'Ótimo desempenho! Mantenha o nível e explore repertórios mais variados.',
  'Texto com boas ideias, mas precisa de mais desenvolvimento argumentativo.',
  'Excelente produção! Domínio impressionante de todos os critérios.',
  'Redação com potencial. Foque em C4 para aprofundar os argumentos.',
  'Continue praticando! Há muita margem para evolução.',
  'Texto equilibrado. Pequenos ajustes em C5 vão elevar bastante a nota.',
  'Boa compreensão do tema. Trabalhe a estrutura dissertativa com mais rigor.',
];

const PLANOS_ACAO = [
  'Foque em detalhar a proposta de intervenção (C5) com agente, ação, meio e finalidade.',
  'Trabalhe os conectivos de oposição e a progressão temática entre os parágrafos.',
  'Pratique textos dissertativos e leia redações nota 1000 para referência.',
  'Aprofunde C4 com evidências concretas e dados para sustentar os argumentos.',
  'Revise as regras da norma padrão e reduza os desvios de C1.',
  'Explore repertórios socioculturais mais variados para enriquecer C2.',
  'Mantenha o nível. Explore temas interdisciplinares para se preparar para o ENEM.',
  'Trabalhe C3 para garantir a progressão temática e a coesão do texto.',
  'Inclua todos os elementos obrigatórios na proposta de intervenção (C5).',
  'Continue evoluindo! Foque no equilíbrio entre as cinco competências.',
];

/** Distribui uma nota final em 5 competências (todas múltiplas de 40). */
function distribuirCompetencias(notaFinal: number, seed: number): number[] {
  const totalUnits = notaFinal / 40;
  const baseUnits = Math.floor(totalUnits / 5);
  let extra = totalUnits - baseUnits * 5;
  const notas: number[] = [];
  for (let i = 0; i < 5; i++) {
    const bonus = ((seed + i) % 5 < extra) ? 1 : 0;
    notas.push((baseUnits + bonus) * 40);
  }
  // Ajustar para garantir a soma correta
  const diff = notaFinal - notas.reduce((a, b) => a + b, 0);
  if (diff !== 0) notas[0] += diff;
  return notas;
}

/** Adiciona N dias a uma string de data (YYYY-MM-DD). */
function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().replace('T12:00:00.000Z', 'T10:00:00Z');
}

/** Alunos e suas turmas (para o gerador). */
const ALUNO_TURMA: Record<string, string> = {
  'aluno-1': 'turma-1', 'aluno-2': 'turma-1', 'aluno-3': 'turma-1',
  'aluno-4': 'turma-1', 'aluno-5': 'turma-1',
  'aluno-6': 'turma-2', 'aluno-7': 'turma-2', 'aluno-8': 'turma-2',
  'aluno-9': 'turma-3', 'aluno-10': 'turma-3',
  'aluno-11': 'turma-1', 'aluno-12': 'turma-1', 'aluno-13': 'turma-1',
  'aluno-14': 'turma-1', 'aluno-15': 'turma-1', 'aluno-16': 'turma-1',
  'aluno-17': 'turma-1', 'aluno-18': 'turma-1', 'aluno-19': 'turma-1',
  'aluno-20': 'turma-1', 'aluno-21': 'turma-1', 'aluno-22': 'turma-1',
  'aluno-23': 'turma-2', 'aluno-24': 'turma-2', 'aluno-25': 'turma-2',
  'aluno-26': 'turma-2', 'aluno-27': 'turma-2', 'aluno-28': 'turma-2',
  'aluno-29': 'turma-2', 'aluno-30': 'turma-2',
};

const MODO_CORRECAO: Record<string, string> = {
  'turma-1': 'hibrido', 'turma-2': 'ia_pura', 'turma-3': 'ia_pura',
};

/** Propostas totalmente corrigidas — todos os alunos das turmas elegíveis. */
const PROPOSTAS_CORRIGIDAS = [
  { id: 'prop-11', dataAgendada: '2026-02-02', turmaIds: ['turma-1', 'turma-2'] },
  { id: 'prop-12', dataAgendada: '2026-02-02', turmaIds: ['turma-1'] },
  { id: 'prop-14', dataAgendada: '2026-02-09', turmaIds: ['turma-1'] },
  { id: 'prop-15', dataAgendada: '2026-02-16', turmaIds: ['turma-1', 'turma-2'] },
  { id: 'prop-16', dataAgendada: '2026-02-16', turmaIds: ['turma-1'] },
  { id: 'prop-17', dataAgendada: '2026-02-23', turmaIds: ['turma-1', 'turma-2'] },
  { id: 'prop-18', dataAgendada: '2026-02-23', turmaIds: ['turma-2'] },
  { id: 'prop-20', dataAgendada: '2026-03-02', turmaIds: ['turma-1'] },
  { id: 'prop-22', dataAgendada: '2026-03-09', turmaIds: ['turma-2'] },
  { id: 'prop-23', dataAgendada: '2026-03-16', turmaIds: ['turma-1', 'turma-2'] },
  { id: 'prop-24', dataAgendada: '2026-03-16', turmaIds: ['turma-1'] },
  { id: 'prop-25', dataAgendada: '2026-03-23', turmaIds: ['turma-1', 'turma-2'] },
  { id: 'prop-27', dataAgendada: '2026-03-30', turmaIds: ['turma-1', 'turma-2'] },
  { id: 'prop-1',  dataAgendada: '2026-03-25', turmaIds: ['turma-1', 'turma-2'] },
];

/** Propostas parcialmente corrigidas (últimas 10 alunos por turma ficam aguardando). */
const PROPOSTAS_PARCIAIS = [
  { id: 'prop-2',  dataAgendada: '2026-03-25', turmaIds: ['turma-1'] },
  { id: 'prop-29', dataAgendada: '2026-04-06', turmaIds: ['turma-1', 'turma-2'] },
  { id: 'prop-30', dataAgendada: '2026-04-06', turmaIds: ['turma-2'] },
];

function gerarDadosEmLote(db: Db): void {
  let redId = 34;
  let devId = 34;

  const ALL_ALUNOS = Object.keys(ALUNO_TURMA);

  // ~15% dos estudantes não entrega por proposta (determinístico, varia por proposta)
  const naoEntregou = (globalPIdx: number, aIdx: number): boolean =>
    ((globalPIdx * 37 + aIdx * 23) % 100) < 15;

  // ── Propostas totalmente corrigidas ────────────────────────────────────────
  PROPOSTAS_CORRIGIDAS.forEach((proposta, pIdx) => {
    const alunosElegiveis = ALL_ALUNOS.filter(a => proposta.turmaIds.includes(ALUNO_TURMA[a]));
    let relIdx = 0;
    alunosElegiveis.forEach((alunoId, aIdx) => {
      if (naoEntregou(pIdx, aIdx)) return; // não entregou — sem redação nem devolutiva

      const seed = pIdx * 31 + relIdx;
      relIdx++;
      const nota = NOTAS_POOL[seed % NOTAS_POOL.length];
      const turmaId = ALUNO_TURMA[alunoId];
      const modo = MODO_CORRECAO[turmaId] ?? 'hibrido';
      const dataEnvio = addDaysToDate(proposta.dataAgendada, 2 + (relIdx % 3));
      const disponivelEm = addDaysToDate(proposta.dataAgendada, 4 + (relIdx % 2));
      const redacaoId = `red-${redId}`;
      const devolutivaId = `dev-${devId}`;
      redId++;
      devId++;

      db.redacoes.push({
        id: redacaoId, alunoId, propostaId: proposta.id, turmaId,
        status: 'corrigida', dataEnvio, arquivoUrl: '/mock-essay.jpg',
        modoCorrecaoAplicado: 'hibrido' as ModoCorrecao,
      });

      const notasComp = distribuirCompetencias(nota, seed);
      db.devolutivas.push({
        id: devolutivaId, redacaoId, notaFinal: nota, disponivelEm,
        comentarioGeral: COMENTARIOS_GERAIS[seed % COMENTARIOS_GERAIS.length],
        planoDeAcao: PLANOS_ACAO[seed % PLANOS_ACAO.length],
        competencias: ['C1','C2','C3','C4','C5'].map((cod, ci) => ({
          codigo: cod as 'C1'|'C2'|'C3'|'C4'|'C5',
          titulo: COMPETENCIAS_TITULOS[cod],
          nota: notasComp[ci],
          comentario: pickComment(cod, seed + ci),
        })),
        comentarios: [{ id: `com-g-${devId - 1}`, texto: COMENTARIOS_GERAIS[seed % COMENTARIOS_GERAIS.length] }],
      });
    });
  });

  // ── Propostas parcialmente corrigidas ("Falta corrigir") ──────────────────
  PROPOSTAS_PARCIAIS.forEach((proposta, pIdx) => {
    const globalPIdx = PROPOSTAS_CORRIGIDAS.length + pIdx;
    const alunosElegiveis = ALL_ALUNOS.filter(a => proposta.turmaIds.includes(ALUNO_TURMA[a]));

    // Pré-calcula participantes (excluindo ~15% que não entregam) para split 70/30
    const participantes = alunosElegiveis.filter((_, aIdx) => !naoEntregou(globalPIdx, aIdx));
    const nAguardando = Math.max(1, Math.round(participantes.length * 0.3));
    const nCorrigidos = participantes.length - nAguardando;

    let relIdx = 0;
    alunosElegiveis.forEach((alunoId, aIdx) => {
      if (naoEntregou(globalPIdx, aIdx)) return; // não entregou

      const seed = globalPIdx * 31 + relIdx;
      const isCorrigida = relIdx < nCorrigidos;
      relIdx++;
      const nota = NOTAS_POOL[seed % NOTAS_POOL.length];
      const turmaId = ALUNO_TURMA[alunoId];
      const modo = MODO_CORRECAO[turmaId] ?? 'hibrido';
      const dataEnvio = addDaysToDate(proposta.dataAgendada, 2 + (relIdx % 3));
      const disponivelEm = addDaysToDate(proposta.dataAgendada, 4 + (relIdx % 2));
      const redacaoId = `red-${redId}`;
      const devolutivaId = `dev-${devId}`;
      redId++;

      db.redacoes.push({
        id: redacaoId, alunoId, propostaId: proposta.id, turmaId,
        status: isCorrigida ? 'corrigida' : 'aguardando_liberacao',
        dataEnvio, arquivoUrl: '/mock-essay.jpg',
        modoCorrecaoAplicado: 'hibrido' as ModoCorrecao,
      });

      const notasComp = distribuirCompetencias(nota, seed);

      if (isCorrigida) {
        devId++;
        db.devolutivas.push({
          id: devolutivaId, redacaoId, notaFinal: nota, disponivelEm,
          comentarioGeral: COMENTARIOS_GERAIS[seed % COMENTARIOS_GERAIS.length],
          planoDeAcao: PLANOS_ACAO[seed % PLANOS_ACAO.length],
          competencias: ['C1','C2','C3','C4','C5'].map((cod, ci) => ({
            codigo: cod as 'C1'|'C2'|'C3'|'C4'|'C5',
            titulo: COMPETENCIAS_TITULOS[cod],
            nota: notasComp[ci],
            comentario: pickComment(cod, seed + ci),
          })),
          comentarios: [{ id: `com-g-${devId - 1}`, texto: COMENTARIOS_GERAIS[seed % COMENTARIOS_GERAIS.length] }],
        });
      } else {
        // aguardando_liberacao: gera rascunho da IA para o professor revisar
        db.correcoes.push({
          id: `cor-${redId - 1}`,
          redacaoId,
          notaFinal: nota,
          geradoEm: dataEnvio,
          comentarioGeral: COMENTARIOS_GERAIS[seed % COMENTARIOS_GERAIS.length],
          competencias: ['C1','C2','C3','C4','C5'].map((cod, ci) => ({
            codigo: cod as 'C1'|'C2'|'C3'|'C4'|'C5',
            titulo: COMPETENCIAS_TITULOS[cod],
            nota: notasComp[ci],
            comentario: pickComment(cod, seed + ci),
          })),
        });
      }
    });
  });
}

function buildInitialDb(): Db {
  const db: Db = {
  latencia: { aiMs: 3000, feedbackEtaHoras: 2 },

  escolas: [
    { id: 'esc-1', nome: 'Colégio SAS São Paulo' },
  ],

  turmas: [
    { id: 'turma-1', nome: '3ª série A', escolaId: 'esc-1', professorId: 'prof-1', modoCorrecao: 'hibrido', frequencia: 'semanal' },
    { id: 'turma-2', nome: '3ª série B', escolaId: 'esc-1', professorId: 'prof-1', modoCorrecao: 'ia_pura', frequencia: 'quinzenal' },
    { id: 'turma-3', nome: '2ª série A', escolaId: 'esc-1', professorId: 'prof-2', modoCorrecao: 'ia_pura', frequencia: 'mensal' },
    { id: 'turma-4', nome: '1ª série A', escolaId: 'esc-1', professorId: 'prof-2', modoCorrecao: 'hibrido', frequencia: 'quinzenal' },
  ],

  professores: [
    { id: 'prof-1', nome: 'Isadora P.', escolaId: 'esc-1' },
    { id: 'prof-2', nome: 'Carlos M.', escolaId: 'esc-1' },
  ],

  alunos: [
    { id: 'aluno-1', nome: 'Ana Carolina', turmaId: 'turma-1' },
    { id: 'aluno-2', nome: 'Carlos Silva', turmaId: 'turma-1' },
    { id: 'aluno-3', nome: 'Maria Oliveira', turmaId: 'turma-1' },
    { id: 'aluno-4', nome: 'Lucas Pereira', turmaId: 'turma-1' },
    { id: 'aluno-5', nome: 'Fernanda Costa', turmaId: 'turma-1' },
    { id: 'aluno-6', nome: 'Rafael Almeida', turmaId: 'turma-2' },
    { id: 'aluno-7', nome: 'Juliana Martins', turmaId: 'turma-2' },
    { id: 'aluno-8', nome: 'Pedro Santos', turmaId: 'turma-2' },
    { id: 'aluno-9', nome: 'Beatriz Lima', turmaId: 'turma-3' },
    { id: 'aluno-10', nome: 'Thiago Rocha', turmaId: 'turma-3' },
    // turma-1 — alunos adicionais
    { id: 'aluno-11', nome: 'Beatriz Ferreira', turmaId: 'turma-1' },
    { id: 'aluno-12', nome: 'Gabriel Teixeira', turmaId: 'turma-1' },
    { id: 'aluno-13', nome: 'Isabela Santos', turmaId: 'turma-1' },
    { id: 'aluno-14', nome: 'Matheus Rodrigues', turmaId: 'turma-1' },
    { id: 'aluno-15', nome: 'Camila Alves', turmaId: 'turma-1' },
    { id: 'aluno-16', nome: 'Diego Sousa', turmaId: 'turma-1' },
    { id: 'aluno-17', nome: 'Larissa Gomes', turmaId: 'turma-1' },
    { id: 'aluno-18', nome: 'Bruno Carvalho', turmaId: 'turma-1' },
    { id: 'aluno-19', nome: 'Priya Mendes', turmaId: 'turma-1' },
    { id: 'aluno-20', nome: 'Victor Lima', turmaId: 'turma-1' },
    { id: 'aluno-21', nome: 'Amanda Correia', turmaId: 'turma-1' },
    { id: 'aluno-22', nome: 'Felipe Barbosa', turmaId: 'turma-1' },
    // turma-2 — alunos adicionais
    { id: 'aluno-23', nome: 'Natalia Pinto', turmaId: 'turma-2' },
    { id: 'aluno-24', nome: 'Rodrigo Nascimento', turmaId: 'turma-2' },
    { id: 'aluno-25', nome: 'Vanessa Farias', turmaId: 'turma-2' },
    { id: 'aluno-26', nome: 'Eduardo Moura', turmaId: 'turma-2' },
    { id: 'aluno-27', nome: 'Monique Ribeiro', turmaId: 'turma-2' },
    { id: 'aluno-28', nome: 'Alexandre Castro', turmaId: 'turma-2' },
    { id: 'aluno-29', nome: 'Caroline Dias', turmaId: 'turma-2' },
    { id: 'aluno-30', nome: 'Tiago Freitas', turmaId: 'turma-2' },
  ],

  colecoes: [
    // ── Coleções do calendário semanal (fev–abr 2026) ────────────────────────────
    // Pratique Redação • 1–13 (laranja) — uma por semana, ordem cronológica
    { id: 'col-pr-1',  nome: 'Pratique Redação • 1',  cor: '#e07b00' },
    { id: 'col-pr-2',  nome: 'Pratique Redação • 2',  cor: '#e07b00' },
    { id: 'col-pr-3',  nome: 'Pratique Redação • 3',  cor: '#e07b00' },
    { id: 'col-pr-4',  nome: 'Pratique Redação • 4',  cor: '#e07b00' },
    { id: 'col-pr-5',  nome: 'Pratique Redação • 5',  cor: '#e07b00' },
    { id: 'col-pr-6',  nome: 'Pratique Redação • 6',  cor: '#e07b00' },
    { id: 'col-pr-7',  nome: 'Pratique Redação • 7',  cor: '#e07b00' },
    { id: 'col-pr-8',  nome: 'Pratique Redação • 8',  cor: '#e07b00' },
    { id: 'col-pr-9',  nome: 'Pratique Redação • 9',  cor: '#e07b00' },
    { id: 'col-pr-10', nome: 'Pratique Redação • 10', cor: '#e07b00' },
    { id: 'col-pr-11', nome: 'Pratique Redação • 11', cor: '#e07b00' },
    { id: 'col-pr-12', nome: 'Pratique Redação • 12', cor: '#e07b00' },
    { id: 'col-pr-13', nome: 'Pratique Redação • 13', cor: '#e07b00' },
    // Livro I • Aula 1–13 (roxo) — uma por semana, ordem cronológica
    { id: 'col-l3-1',  nome: 'Livro I • Aula 1',  cor: '#6b21a8' },
    { id: 'col-l3-2',  nome: 'Livro I • Aula 2',  cor: '#6b21a8' },
    { id: 'col-l3-3',  nome: 'Livro I • Aula 3',  cor: '#6b21a8' },
    { id: 'col-l3-4',  nome: 'Livro I • Aula 4',  cor: '#6b21a8' },
    { id: 'col-l3-5',  nome: 'Livro I • Aula 5',  cor: '#6b21a8' },
    { id: 'col-l3-6',  nome: 'Livro I • Aula 6',  cor: '#6b21a8' },
    { id: 'col-l3-7',  nome: 'Livro I • Aula 7',  cor: '#6b21a8' },
    { id: 'col-l3-8',  nome: 'Livro I • Aula 8',  cor: '#6b21a8' },
    { id: 'col-l3-9',  nome: 'Livro I • Aula 9',  cor: '#6b21a8' },
    { id: 'col-l3-10', nome: 'Livro I • Aula 10', cor: '#6b21a8' },
    { id: 'col-l3-11', nome: 'Livro I • Aula 11', cor: '#6b21a8' },
    { id: 'col-l3-12', nome: 'Livro I • Aula 12', cor: '#6b21a8' },
    { id: 'col-l3-13', nome: 'Livro I • Aula 13', cor: '#6b21a8' },
    // ── Coleções das propostas de demo (fora do calendário semanal) ───────────────
    { id: 'col-1', nome: 'Pratique Redação • 4', cor: '#e07b00' }, // usado pelas propostas de demo
    { id: 'col-2', nome: 'Livro I • Aula 1',   cor: '#6b21a8' },
    { id: 'col-3', nome: 'Livro I • Aula 4',   cor: '#6b21a8' },
  ],

  propostas: [
    {
      id: "prop-1",
      titulo: "Perspectivas acerca do envelhecimento na sociedade brasileira",
      colecaoId: "col-pr-1",
      dataAgendada: "2026-02-02",
      dataVisivel: "2026-02-02",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-2",
      titulo: "Câmeras corporais em agentes de segurança e a garantia de direitos",
      colecaoId: "col-l3-1",
      dataAgendada: "2026-02-02",
      dataVisivel: "2026-02-02",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-3",
      titulo: "O vício em apostas online como um novo desafio de saúde pública no Brasil",
      colecaoId: "col-pr-2",
      dataAgendada: "2026-02-09",
      dataVisivel: "2026-02-09",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-4",
      titulo: "A influência das redes sociais na polarização política e no discurso de ódio",
      colecaoId: "col-l3-2",
      dataAgendada: "2026-02-09",
      dataVisivel: "2026-02-09",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-5",
      titulo: "Desafios e oportunidades da educação à distância no século XXI",
      colecaoId: "col-pr-3",
      dataAgendada: "2026-02-16",
      dataVisivel: "2026-02-16",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-6",
      titulo: "A importância da preservação das línguas indígenas no Brasil",
      colecaoId: "col-l3-3",
      dataAgendada: "2026-02-16",
      dataVisivel: "2026-02-16",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-7",
      titulo: "Os desafios da mobilidade urbana nas grandes cidades brasileiras",
      colecaoId: "col-pr-4",
      dataAgendada: "2026-02-23",
      dataVisivel: "2026-02-23",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-8",
      titulo: "A crise hídrica e os impactos sobre o abastecimento no Brasil",
      colecaoId: "col-l3-4",
      dataAgendada: "2026-02-23",
      dataVisivel: "2026-02-23",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-9",
      titulo: "Violência contra a mulher: desafios e avanços no combate ao feminicídio",
      colecaoId: "col-pr-5",
      dataAgendada: "2026-03-02",
      dataVisivel: "2026-03-02",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-10",
      titulo: "O papel da inteligência artificial na transformação do mercado de trabalho",
      colecaoId: "col-l3-5",
      dataAgendada: "2026-03-02",
      dataVisivel: "2026-03-02",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-11",
      titulo: "O impacto do uso de agrotóxicos na saúde pública brasileira",
      colecaoId: "col-pr-6",
      dataAgendada: "2026-03-09",
      dataVisivel: "2026-03-09",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-12",
      titulo: "Desafios da inclusão digital para idosos no Brasil contemporâneo",
      colecaoId: "col-l3-6",
      dataAgendada: "2026-03-09",
      dataVisivel: "2026-03-09",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-13",
      titulo: "A herança colonial e seus reflexos na desigualdade racial brasileira",
      colecaoId: "col-pr-7",
      dataAgendada: "2026-03-16",
      dataVisivel: "2026-03-16",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-14",
      titulo: "O papel da arte e da cultura na formação da identidade nacional",
      colecaoId: "col-l3-7",
      dataAgendada: "2026-03-16",
      dataVisivel: "2026-03-16",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-15",
      titulo: "Saúde mental no ambiente escolar: desafios e responsabilidades",
      colecaoId: "col-pr-8",
      dataAgendada: "2026-03-23",
      dataVisivel: "2026-03-23",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-16",
      titulo: "A crise da representatividade política e o desengajamento da juventude",
      colecaoId: "col-l3-8",
      dataAgendada: "2026-03-23",
      dataVisivel: "2026-03-23",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-17",
      titulo: "Segurança alimentar e o combate à fome: responsabilidades do Estado",
      colecaoId: "col-pr-9",
      dataAgendada: "2026-03-30",
      dataVisivel: "2026-03-30",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-18",
      titulo: "O modelo de negócios das plataformas digitais e seus impactos sociais",
      colecaoId: "col-l3-9",
      dataAgendada: "2026-03-30",
      dataVisivel: "2026-03-30",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-19",
      titulo: "Violência urbana e suas raízes na desigualdade socioeconômica",
      colecaoId: "col-pr-10",
      dataAgendada: "2026-04-06",
      dataVisivel: "2026-04-06",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-20",
      titulo: "A privatização de serviços públicos essenciais no Brasil",
      colecaoId: "col-l3-10",
      dataAgendada: "2026-04-06",
      dataVisivel: "2026-04-06",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-21",
      titulo: "Trabalho infantil: desafios para a erradicação no Brasil",
      colecaoId: "col-pr-11",
      dataAgendada: "2026-04-13",
      dataVisivel: "2026-04-13",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-22",
      titulo: "O impacto das mudanças climáticas nas populações mais vulneráveis",
      colecaoId: "col-l3-11",
      dataAgendada: "2026-04-13",
      dataVisivel: "2026-04-13",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-23",
      titulo: "Desinformação e fake news: ameaças à democracia brasileira",
      colecaoId: "col-pr-12",
      dataAgendada: "2026-04-20",
      dataVisivel: "2026-04-20",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-24",
      titulo: "Acesso à saúde pública: os desafios do SUS no século XXI",
      colecaoId: "col-l3-12",
      dataAgendada: "2026-04-20",
      dataVisivel: "2026-04-20",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-25",
      titulo: "A questão fundiária e os conflitos agrários no Brasil",
      colecaoId: "col-pr-13",
      dataAgendada: "2026-04-27",
      dataVisivel: "2026-04-27",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-26",
      titulo: "O envelhecimento da população e os desafios da previdência social",
      colecaoId: "col-l3-13",
      dataAgendada: "2026-04-27",
      dataVisivel: "2026-04-27",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-27",
      titulo: "Discriminação étnico-racial no mercado de trabalho brasileiro",
      colecaoId: "col-pr-14",
      dataAgendada: "2026-05-04",
      dataVisivel: "2026-05-04",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-28",
      titulo: "A crise climática e o papel do Brasil nas negociações internacionais",
      colecaoId: "col-l3-14",
      dataAgendada: "2026-05-04",
      dataVisivel: "2026-05-04",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-29",
      titulo: "Educação financeira como ferramenta de combate à pobreza",
      colecaoId: "col-pr-15",
      dataAgendada: "2026-05-11",
      dataVisivel: "2026-05-11",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-30",
      titulo: "O impacto do desmatamento da Amazônia na biodiversidade global",
      colecaoId: "col-l3-15",
      dataAgendada: "2026-05-11",
      dataVisivel: "2026-05-11",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-31",
      titulo: "Desigualdade de gênero e as barreiras para a ascensão profissional feminina",
      colecaoId: "col-pr-16",
      dataAgendada: "2026-05-18",
      dataVisivel: "2026-05-18",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-32",
      titulo: "O futuro das cidades: urbanização sustentável e qualidade de vida",
      colecaoId: "col-l3-16",
      dataAgendada: "2026-05-18",
      dataVisivel: "2026-05-18",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-33",
      titulo: "Povos indígenas: direitos territoriais e as pressões do agronegócio",
      colecaoId: "col-pr-17",
      dataAgendada: "2026-05-25",
      dataVisivel: "2026-05-25",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-34",
      titulo: "Trabalho análogo à escravidão: um crime persistente no Brasil contemporâneo",
      colecaoId: "col-l3-17",
      dataAgendada: "2026-05-25",
      dataVisivel: "2026-05-25",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-35",
      titulo: "Doenças negligenciadas e o impacto na saúde das populações carentes",
      colecaoId: "col-pr-18",
      dataAgendada: "2026-06-01",
      dataVisivel: "2026-06-01",
      status: "agendada",
      imageUrl: "/images/pratique-redacao.jpg",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
    {
      id: "prop-36",
      titulo: "Consumismo e descarte eletrônico: desafios ambientais do século XXI",
      colecaoId: "col-l3-18",
      dataAgendada: "2026-06-01",
      dataVisivel: "2026-06-01",
      status: "agendada",
      imageUrl: "/images/livro3.png",
      turmaIds: ["turma-1", "turma-2", "turma-3"],
    },
  ],

  redacoes: [
    // prop-3 — ativa — enviadas recentes
    { id: 'red-11', alunoId: 'aluno-4', propostaId: 'prop-3', turmaId: 'turma-1', status: 'pendente_envio', modoCorrecaoAplicado: 'hibrido' },
    { id: 'red-12', alunoId: 'aluno-5', propostaId: 'prop-3', turmaId: 'turma-1', status: 'enviada', dataEnvio: '2026-04-06T14:00:00Z', arquivoUrl: '/mock-essay.jpg', modoCorrecaoAplicado: 'hibrido' },
  ],

  correcoes: [],

  liberacoes: [],

  devolutivas: [],

  evolucoes: [
    {
      alunoId: 'aluno-1',
      historico: [
        { data: '2026-02-02', notaFinal: 620, competencias: { C1: 120, C2: 120, C3: 120, C4: 160, C5: 100 } },
        { data: '2026-02-09', notaFinal: 680, competencias: { C1: 120, C2: 160, C3: 120, C4: 160, C5: 120 } },
        { data: '2026-02-16', notaFinal: 640, competencias: { C1: 120, C2: 160, C3: 120, C4: 120, C5: 120 } },
        { data: '2026-02-23', notaFinal: 700, competencias: { C1: 160, C2: 160, C3: 120, C4: 160, C5: 100 } },
        { data: '2026-03-02', notaFinal: 760, competencias: { C1: 160, C2: 200, C3: 160, C4: 160, C5: 80 } },
        { data: '2026-03-09', notaFinal: 720, competencias: { C1: 160, C2: 160, C3: 160, C4: 160, C5: 80 } },
        { data: '2026-03-25', notaFinal: 760, competencias: { C1: 160, C2: 200, C3: 160, C4: 160, C5: 80 } },
      ],
    },
    {
      alunoId: 'aluno-2',
      historico: [
        { data: '2026-02-02', notaFinal: 800, competencias: { C1: 160, C2: 160, C3: 160, C4: 160, C5: 160 } },
        { data: '2026-02-23', notaFinal: 880, competencias: { C1: 160, C2: 200, C3: 200, C4: 160, C5: 160 } },
        { data: '2026-03-25', notaFinal: 1000, competencias: { C1: 200, C2: 200, C3: 200, C4: 200, C5: 200 } },
      ],
    },
  ],

  configuracoes: [
    { turmaId: 'turma-1', modoCorrecao: 'hibrido', liberacaoAutomaticaPropostas: false, liberacaoAutomaticaDevolutivas: false, autonomiaAluno: false, liberacaoGradual: true },
    { turmaId: 'turma-2', modoCorrecao: 'ia_pura', liberacaoAutomaticaPropostas: true, liberacaoAutomaticaDevolutivas: true, autonomiaAluno: true, liberacaoGradual: false },
    { turmaId: 'turma-3', modoCorrecao: 'ia_pura', liberacaoAutomaticaPropostas: true, liberacaoAutomaticaDevolutivas: true, autonomiaAluno: false, liberacaoGradual: false },
    { turmaId: 'turma-4', modoCorrecao: 'hibrido', liberacaoAutomaticaPropostas: false, liberacaoAutomaticaDevolutivas: false, autonomiaAluno: false, liberacaoGradual: true },
  ],

  agendasConfig: [
    { turmaId: 'turma-1', liberacaoGradual: true, autonomiaAluno: false },
    { turmaId: 'turma-2', liberacaoGradual: false, autonomiaAluno: true },
  ],

  mensagens: [],
  };
  gerarDadosEmLote(db);
  return db;
}

export const initialDb = buildInitialDb();
