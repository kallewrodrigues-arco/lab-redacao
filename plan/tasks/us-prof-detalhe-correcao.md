---

status: done
delivery-date: "2026-04-09"
task: us-prof-detalhe-correcao

---

## Escopo

- **Tipo**: Front-end (FE)

## Objetivo

Implementar a **Aba Correção** dentro da página de detalhe de proposta do professor — interface de visualização e liberação da correção IA (US8): fila de redações, ajuste de notas por competência, liberação.

## Design Specs

**Figma**: `@https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-16629&m=dev`
**Rota**: `/professor/propostas/[id]?aba=correcao`

---

## Aba Correção

### Layout

- **Barra de filtros** (abaixo do header de abas):
  - Dropdown **aluno** (ex.: "Isadora P.") — navega entre redações da mesma proposta
  - Dropdown **Turma**
  - Dropdown **status** (ex.: "Não corrigidas")
  - Paginação: "1 de 30" + botões `←` `→`
- **Área central**: imagem da redação manuscrita com marcações coloridas (anotações IA)
  - Toolbar vertical esquerda: ferramentas de anotação (cursor, marcação, seta, mão, zoom)
  - Controle de zoom no canto inferior esquerdo: `100%` com botões `+` `-`
- **Painel direito** (~300px):
  - **Nota final**: valor ex. `880 / 1.000` + barra de progresso
  - Tabs: **Nota** | **Comentários**
  - **Aba Nota** — por competência (C1–C5):
    - Título da competência (ex.: "C1 — Dominar a escrita formal")
    - Seletor de pontos em pills: `40 | 80 | 120 | 160 | 200 | Zero` (pill ativa destacada)
    - Comentário gerado pela IA + link "Mais detalhes"
  - **Aba Comentários**: lista de todos os comentários (geral + por competência)

### Ações e lógica de liberação

- Carregar rascunho IA via `GET /api/redacoes/[id]/correcao_rascunho`
- Alterar pill de pontuação → recalcula Nota final em tempo real
- Editar comentário por competência (campo de texto expandível)
- Botão **Liberar notas** (header, libera todas as redações da proposta):
  - Chama `POST /api/propostas/[id]/liberar-notas`
  - Transiciona todas as redações `aguardando_liberacao` → `corrigida`
  - Estudantes passam a acessar as abas de correção (modo visualização) e resultados

---

## Entregáveis

- Aba Correção: barra de filtros (aluno, turma, status, paginação)
- Área central: imagem da redação com toolbar de anotação e controle de zoom
- Painel direito: nota final + tabs Nota/Comentários + pills C1–C5 + campos editáveis

## Critérios de pronto

- Aba Correção carrega rascunho IA, permite ajustar notas C1–C5 com recálculo em tempo real
- Liberação de notas para alunos transiciona o status e avança para a próxima redação
- Fluxo "rascunho IA" → professor ajusta → Libera notas → devolutiva publicada ao aluno" é demonstrável ponta a ponta

## Dependências

- **us-prof-detalhe-proposta** (shell da página com tabs)
- Tarefa 3 (rotas), Tarefa 5 (API correção/liberação), Tarefa 11 (us9-aluno-envio)

