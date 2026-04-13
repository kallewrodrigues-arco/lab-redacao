---
status: done
delivery-date: "2026-04-10"
---

# Task: us-prof-home-visao-geral

## Escopo
- **Tipo**: Front-end (FE) + API

## Objetivo
Implementar o painel **"Visão Geral"** na home do professor — 3 cards em linha no topo da página com dados agregados de todo o laboratório: Atividades (contadores + barra segmentada), Alunos (total inscrito) e Participação (gauge half-donut).

## Design Specs
**Figma**: `@https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-redação?node-id=338-31348&m=dev`

### Layout geral
- 3 cards em linha, `gap: 8px`, `height: 187px`
- Todos: `background: white`, `border: 1px solid var(--border-secondary)`

### Card 1 — Atividades
- `border-radius: 24px`, `padding: 24px`, `flex: 1`
- **Título**: "Atividades" — 16px / 500 / `--text-label`
- **4 Score items** (Atrasadas, A corrigir, Corrigidas, Descartadas):
  - Número (24px/600) + tag circular 24×24px com ícone 16×16px
  - Label 14px/400 centralizado abaixo
- **Barra segmentada** 16px de altura: vermelho → amarelo → verde → cinza, proporcional aos valores

### Card 2 — Alunos
- `border-radius: 16px`, `width: 200px`, `padding: 24px`
- Título, número em destaque, subtítulo "Inscritos no laboratório sob sua gestão"

### Card 3 — Participação
- `border-radius: 24px`, `width: 219px`, `padding: 24px`
- Half-donut SVG: arco cinza de fundo + arco amarelo `#f7c664` proporcional ao percentual
- Centro: "Média" + percentual

## API

### `GET /api/home/overview`
Criado em `src/app/api/home/overview/route.ts`. Retorna:
```json
{
  "atrasadas": 0,
  "pendentes": 0,
  "corrigidas": 0,
  "rejeitadas": 0,
  "totalAlunos": 0,
  "participacaoMedia": 0
}
```
- `participacaoMedia` = redações com status ≠ `pendente_envio` / total de alunos × 100

## Entregáveis
- [x] `GET /api/home/overview` retornando todos os dados agregados
- [x] Card "Atividades" com 4 scores + barra segmentada
- [x] Card "Alunos" com total inscrito
- [x] Card "Participação" com half-donut SVG
- [x] Componente `VisaoGeral` inserido no topo da home do professor

## Critérios de pronto
- Acessar `/professor` exibe os 3 cards acima do cabeçalho de "Próximas propostas"
- Números refletem os dados do seed
- Barra segmentada proporcional; se total = 0, exibe barra cinza
- Gauge half-donut rotaciona conforme percentual de participação
