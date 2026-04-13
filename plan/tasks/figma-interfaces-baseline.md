---
status: done
delivery-date: "2026-04-07"
---

# Task: figma-interfaces-baseline

## Escopo
- **Tipo**: Front-end (FE)

## Objetivo
Consolidar as **interfaces do Figma** que balizam a Fase 1 (telas/frames por persona + estados) e transformar em um **checklist de fidelidade** (UI states + navegação) para orientar a implementação.

## Entregáveis
- Lista de telas/frames por persona (**Aluno**, **Professor**, **Gestor**).
- Lista de estados obrigatórios por tela (ex.: loading, empty state, erro "foto ilegível", lista vazia/cheia).
- Mapa de navegação (rotas e transições) para o protótipo.

## Telas do figma

### Fluxo do Gestor
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=37-5233&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=37-4811&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=37-5515&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=37-5673&m=dev

### Fluxo do professor
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=86-19349&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=37-9542&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-16603&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-16618&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-17364&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-16629&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-16719&m=dev

### Fluxo do estudante

- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=136-29562&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30033&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30034&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30035&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30036&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30037&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30038&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30039&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30041&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30042&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30043&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30044&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30045&m=dev
- @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=143-30046&m=dev

---

## Checklist de interfaces — Fase 1

### Gestor

| # | Tela | Rota | Figma node | Estados obrigatórios |
|---|------|------|------------|----------------------|
| G1 | Home (com seções US1–US5) | `/gestor` | 86:19349 | com dados, loading, empty |
| G2 | Configurar Lab — passo vazio | `/gestor/configurar` | 37:5233 | sem turmas, com turmas |
| G3 | Drawer "Selecionar turmas" — vazio | modal | 37:4811 | nenhuma selecionada, Concluir desabilitado |
| G4 | Drawer "Selecionar turmas" — com seleção | modal | 37:5515 | ≥1 selecionada, Concluir habilitado |
| G5 | Configurar Lab — preenchido | `/gestor/configurar` | 37:5673 | turmas adicionadas, frequência + professor selecionáveis |

**Seções do home gestor (G1):**
- Status (contadores: Atrasadas, Pendentes, Corrigidas, Rejeitadas) + botão "Configuração"
- Próximas propostas (cards com imagem, coleção, data visibilidade)
- Correções pendentes (lista top 3 + "Mostrar todos")
- Acompanhe o desempenho — lista redações corrigidas (top 3 + "Mostrar todos")
- Desempenho geral: Participação %, Desempenho médio /1000, Resultado por competência (C1–C5), Evolução do desempenho (gráfico de barras)

---

### Professor

| # | Tela | Rota | Figma node | Estados obrigatórios |
|---|------|------|------------|----------------------|
| P1 | Home / Dashboard | `/professor` | 86:19349 | com dados, loading, empty |
| P2 | Próximas propostas (lista) | `/professor/propostas` | 37:9542 | com itens, lista vazia, filtros ativos |
| P3 | Proposta — aba Manual pedagógico | `/professor/propostas/[id]` | 40:16603 | conteúdo carregado |
| P4 | Proposta — aba Proposta de redação | `/professor/propostas/[id]` | 40:16618 | documento ENEM |
| P5 | Proposta — aba Material de apoio | `/professor/propostas/[id]` | 40:17364 | vídeo player |
| P6 | Correção (validação IA) | `/professor/propostas/[id]/correcao` | 40:16629 | com rascunho IA, validada, rejeitada |
| P7 | Resultados da turma | `/professor/propostas/[id]/resultados` | 40:16719 | com dados, sem alunos |

**Seções do home professor (P1):**
- Próximas propostas (top 3 cards)
- Correções pendentes (lista top 3 + "Mostrar todos")
- Acompanhe o desempenho — redações corrigidas (top 3 + "Mostrar todos")
- Seção de desempenho (sem breakdown de turma — isso é exclusivo do gestor)

**Tela P2 — Próximas propostas:**
- Filtros: "Todas as coleções" dropdown, "Qualquer status" dropdown
- Tabs: Semanas / Propostas
- Agrupamento por semana (data destacada)
- Status por item: "Visível em DD/MM" (verde), "Oculto até DD/MM" (azul), "Descartada" (cinza)
- Ações por item: Descartar / Alterar datas / Agendar

**Tela P6 — Correção:**
- Header: nome do aluno (dropdown), Turma (dropdown), status (dropdown), paginação (1 de N)
- Área central: imagem da redação manuscrita com zoom (100%, 200%)
- Painel direito: Nota final (NNN/1.000), tabs Nota / Comentários
- Aba Nota: por competência (C1–C5), seletor de pontos (40/80/120/160/200/Zero), comentário IA com "Mais detalhes"
- Aba Comentários: "Todos os comentários" filtro, lista de comentários (geral + por competência)

**Tela P7 — Resultados:**
- Stats: Participação % (X de N alunos), Desempenho médio /1.000
- Resultado por competência: grid C1–C5 (nota média + tag Desafiar/Acompanhar/Intervir)
- Gráficos: Distribuição da nota final (histograma), Distribuição por competência (seletor)
- Tabela alunos: Nome, Turma, Nota final (barra + valor), C1–C5

---

### Aluno

| # | Tela | Rota | Figma node | Estados obrigatórios |
|---|------|------|------------|----------------------|
| A1 | Home | `/aluno` | 136:29562 | com dados, sem propostas, loading |
| A2 | Proposta — intro | `/aluno/propostas/[id]` | 143:30033 | empty state pré-início |
| A3 | Material de apoio (vídeo) | `/aluno/propostas/[id]/material` | 143:30034 | vídeo carregado |
| A4 | Proposta de redação (documento) | `/aluno/propostas/[id]/proposta` | 143:30035, 143:30036 | documento carregado |
| A5 | Câmera — capturando | `/aluno/propostas/[id]/enviar` | 143:30037 | câmera ativa (bounding box verde) |
| A6 | Câmera — confirmar foto | `/aluno/propostas/[id]/enviar` | 143:30038 | foto capturada, "A foto ficou boa?" |
| A7 | Upload — progress | transição automática | 143:30039 | progresso 0→100% |
| A8 | Devolutiva — loading IA pura | `/aluno/propostas/[id]/devolutiva` | 143:30041 | "Corrigindo sua redação" spinner |
| A9 | Devolutiva — aguardando híbrido | `/aluno/propostas/[id]/devolutiva` | 143:30042 | "Aguardando correção" empty state |
| A10 | Devolutiva — nota por competência | `/aluno/propostas/[id]/devolutiva` | 143:30043 | nota final + C1–C5 com comentários |
| A11 | Devolutiva — seu texto | `/aluno/propostas/[id]/devolutiva` | 143:30044 | imagem essay (100%) |
| A12 | Devolutiva — texto zoom | `/aluno/propostas/[id]/devolutiva` | 143:30045 | imagem essay (200%) |
| A13 | Devolutiva — comentários | `/aluno/propostas/[id]/devolutiva` | 143:30046 | lista comentários geral + C4 |

**Seções do home aluno (A1) — mobile-first:**
- Destaque última nota (pontos acima da anterior, "Ver devolutiva")
- Tabs: Para esta semana / Atrasadas / Corrigidas
- Cards de proposta (imagem, coleção, título truncado)
- "Para você ficar em dia" (atrasadas, top 3 + "Mostrar todos")
- "Redações corrigidas" (top 3 + "Mostrar todos")
- "Acompanhe seu progresso": Desempenho médio /1000, gráfico barras, por competência (C1–C5 nota)

**Fluxo de envio (A5→A10):**
1. Câmera ativa → bounding box verde detecta folha
2. Capturar → "A foto ficou boa?" → Enviar esta foto / Fotografar de novo
3. Upload progress (arquivo + %)
4. Estado pós-envio: `ia_pura` → loading "Corrigindo..." | `hibrido` → "Aguardando correção"
5. Quando disponível → Devolutiva com tabs: Nota / Seu texto / Comentários

**Aba Nota (A10):**
- Nota final NNN/1.000 + barra de progresso
- C1–C5: título, seletor pills (40/80/120/160/200/Zero — pill selecionada destacada), comentário expansível

---

## Mapa de navegação do protótipo

```
/                          → Seletor de persona

/gestor
  /configurar              → Setup do lab (G2–G5)
  /propostas               → Próximas propostas (reutiliza P2)
  /propostas/[id]          → Detalhe proposta (reutiliza P3–P5)
  /propostas/[id]/correcao → Correção (reutiliza P6)
  /propostas/[id]/resultados → Resultados (P7)

/professor
  /propostas               → Próximas propostas (P2)
  /propostas/[id]          → Detalhe proposta (P3–P5)
  /propostas/[id]/correcao → Correção (P6)
  /propostas/[id]/resultados → Resultados (P7)

/aluno
  /propostas/[id]          → Intro proposta (A2)
  /propostas/[id]/material → Material de apoio (A3)
  /propostas/[id]/proposta → Documento proposta (A4)
  /propostas/[id]/enviar   → Câmera/upload (A5–A7)
  /propostas/[id]/devolutiva → Devolutiva (A8–A13)
```

---

## Componentes base identificados

| Componente | Usado em |
|-----------|---------|
| `PropostaCard` | Home professor (próximas), Home aluno |
| `EssayListItem` | Correções pendentes, Corrigidas (listas) |
| `CompetencyScoreRow` | Devolutiva (aluno), Correção (professor) |
| `PerformanceBar` | Desempenho gestor/professor, Home aluno |
| `StatusBadge` | Status propostas (Visível/Oculto/Descartada) |
| `SectionHeader` | Cabeçalhos de seção com "Mostrar todos" |
| `CounterCard` | Cards de status (Atrasadas/Pendentes/Corrigidas/Rejeitadas) |
| `SidebarNav` | Layout professor/gestor (desktop) |
| `MobileTabBar` | Layout aluno (mobile) |
| `BarChart` | Evolução desempenho, Distribuição notas |

---

## Critérios de pronto
- [x] Checklist cobre as jornadas principais (Aluno: envio+devolutiva; Professor: validação+agenda; Gestor: home+desempenho).
- [x] Cada tela tem estados mínimos documentados.
- [x] Navegação do protótipo pode ser derivada diretamente do checklist.
