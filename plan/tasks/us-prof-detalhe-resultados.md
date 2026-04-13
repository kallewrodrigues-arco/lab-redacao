---
status: done
delivery-date: "2026-04-09"
---

# Task: us-prof-detalhe-resultados

## Escopo
- **Tipo**: Front-end (FE)

## Objetivo
Implementar a **Aba Resultados** dentro da página de detalhe de proposta do professor — visão agregada da turma: participação, desempenho médio, resultados por competência, gráficos de distribuição e tabela de alunos.

## Design Specs
**Figma**: `@https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-16719&m=dev`
**Rota**: `/professor/propostas/[id]?aba=resultados`

---

## Aba Resultados

### Layout
- **Cards de resumo** (2 colunas):
  - Participação: `50%` + barra + `50 de 100 estudantes participaram`
  - Desempenho médio: `800,5 / 1.000` + barra + legenda
- **Resultado por competência** — grid C1–C5 (cards):
  - Código + título + nota média + tag: `Desafiar` (verde) | `Acompanhar` (laranja) | `Intervir` (vermelho)
- **Gráficos** (2 lado a lado):
  - Distribuição da nota final (histograma: faixas 0–200, 201–400, 401–600, 601–800, 801–1.000)
  - Distribuição por competência (histograma com seletor de competência via dropdown)
- **Seção Estudantes**:
  - Campo de busca: "Buscar estudante ou turma"
  - Linha de referência: `Desempenho médio: 800,5`
  - Tabela: Nome | Turma | Nota final (barra + valor) | C1 | C2 | C3 | C4 | C5

---

## Entregáveis
- [x] Aba Resultados: cards de resumo (participação + desempenho médio)
- [x] Grid C1–C5 com nota média e tag de classificação (Desafiar/Acompanhar/Intervir)
- [x] Histograma de distribuição da nota final
- [x] Histograma de distribuição por competência com seletor dropdown
- [x] Tabela de alunos com busca, linha de referência e colunas C1–C5

## Critérios de pronto
- Aba Resultados exibe os dados agregados da turma com dados do seed
- Cards, gráficos e tabela renderizam corretamente e são responsivos
- Tags de competência (Desafiar/Acompanhar/Intervir) refletem a nota média de cada C1–C5
- Busca na tabela filtra alunos por nome ou turma em tempo real

## Dependências
- **us-prof-detalhe-proposta** (shell da página com tabs)
- Tarefa 3 (rotas), Tarefa 4 (API propostas/redações)
