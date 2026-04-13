---
status: done
delivery-date: "10/04/2026"
---

# Task: us-prof-home-relatorio-geral

## Escopo
- **Tipo**: Front-end (FE) + API

## Objetivo
Implementar a seção **"Acompanhe o desempenho"** como última seção da home do professor — relatório agregado do laboratório com métricas de participação, desempenho médio, resultado por competência (C1–C5) e gráfico de evolução temporal.

## Design Specs
**Figma**: `@https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-redação?node-id=315-23967&m=dev`
**Rota**: `/professor` (última seção da home)

---

## Subseção 1 — Métricas em cards (2 lado a lado)

Ambos os cards: `background: white`, `border: border-secondary`, `border-radius: 16px`, `padding: 24px`, `flex: 1`, `gap: 24px` entre eles

### Card "Participação"
- Título: 18px / 600 / `#232831`
- Valor: `{participacaoMedia}%` — 28px / 600 / `#232831`
- Barra de progresso: `height: 8px`, bg `#f5f7fa`, fill `#3b9bde`, fill-width proporcional ao %
- Caption: "Média de participação em cada proposta" — 14px / `#626c80`
- **Cálculo**: média do percentual (alunos que enviaram / alunos elegíveis) por proposta ativa

### Card "Desempenho médio"
- Título: 18px / 600 / `#232831`
- Valor: `{desempenhoMedio}` + ` / 1.000` (separado, 20px / 400 / `#626c80`)
- Barra de progresso: fill-width = `desempenhoMedio / 10`%
- Caption: "Desempenho médio dos estudantes nos últimos 30 dias" — 14px / `#626c80`
- **Cálculo**: média do `notaFinal` de devolutivas de propostas com `dataAgendada` nos últimos 30 dias

---

## Subseção 2 — Resultado por competência

Heading: "Resultado por competência" — 20px / 600 / `#232831` / letterSpacing -0.2px

5 cards C1–C5 em linha (`gap: 24px`, `flex: 1`). Cada card:
- `background: white`, `border: border-secondary`, `border-radius: 16px`, `padding: 24px`
- Tag código (ex: "C1"): bg `#d2d9e5`, text `#4d5666`, 14px/500, h: 24px, px: 8px, border-radius: 9999px
- Título da competência: 16px / 500 / `#232831`, overflow ellipsis
- Nota: `{notaMedia} / 200` — notaMedia em 24px/600/`#232831`, "/ 200" em 16px/400/`#626c80`
- Tag classificação (h: 24px, px: 8px, border-radius: 9999px):
  - **Desafiar** (≥160 pts): bg `#a8f7d0`, text `#0c7742`
  - **Acompanhar** (≥80 pts): bg `#ffe1a6`, text `#a05100`
  - **Intervir** (<80 pts): bg `#ffada6`, text `#a10e00`

Títulos das competências:
- C1: Dominar a escrita formal
- C2: Compreender o tema
- C3: Interpretar e organizar ideias
- C4: Dominar a argumentação
- C5: Propor solução respeitosa

---

## Subseção 3 — Gráfico "Evolução do desempenho"

Container: `background: white`, `border: border-secondary`, `border-radius: 16px`, `padding: 24px`, `height: 395px`

### Header
- Esquerda: título "Evolução do desempenho" (18px/600/`#232831`) + caption "Média das notas finais em todas as propostas nos últimos 60 dias" (14px/`#626c80`)
- Direita: 2 chips decorativos (V1 estáticos):
  - "Todas as turmas ↓" e "Semanal ↓"
  - Estilo: bg white, `border: 1px solid #3b9bde`, text `#0460a1`, 14px/500, h: 32px, px: 12px, border-radius: 9999px

### Área do gráfico (altura: 255px, CSS puro sem biblioteca)
- **Eixo Y** (w: 48px): labels 100/80/60/40/20/0 (14px/`#626c80`, text-right) + 5 linhas horizontais `border-top: 1px solid #abb3c4`
- **Colunas**: flex row, align-items: flex-end, gap: 8px
  - Barra: w: 32px, altura proporcional ao valor (0–100%), bg `#3ccc84`, crescendo de baixo
  - Label X: data da semana (ex: "02 fev"), 14px / `#232831`, centered
- **Escala**: `notaFinal / 10` → normaliza 0–1000 para 0–100
- **Dados**: média semanal, agrupada pelo `dataAgendada` da proposta (semana da segunda-feira), últimas 9 semanas com dados

---

## API

### `GET /api/home/relatorio`
Criar `src/app/api/home/relatorio/route.ts`

Resposta:
```json
{
  "participacaoMedia": 67,
  "desempenhoMedio": 721.5,
  "competencias": [
    { "codigo": "C1", "titulo": "Dominar a escrita formal", "notaMedia": 172.4, "tag": "Desafiar" },
    ...
  ],
  "evolucao": [
    { "semana": "02 fev", "media": 62 },
    ...
  ]
}
```

---

## Entregáveis
- [ ] `GET /api/home/relatorio` com os 4 campos calculados
- [ ] Card "Participação" com valor e barra proporcional
- [ ] Card "Desempenho médio" com valor formatado e barra proporcional
- [ ] 5 cards C1–C5 com nota média e tag de classificação
- [ ] Gráfico de barras CSS puro com eixo Y e labels X
- [ ] `plan/tasks/us-prof-home-relatorio-geral.md` criado ✓

## Critérios de pronto
- Seção aparece ao final de `/professor`, abaixo do bloco "Falta corrigir / Acompanhe o desempenho"
- Métricas batem com os dados do seed
- Tags Desafiar/Acompanhar/Intervir refletem as notas médias das devolutivas
- Gráfico renderiza colunas proporcionais com datas corretas no eixo X

## Dependências
- `us-prof-home-visao-geral` (painel de contadores — concluído)
- Dados de devolutivas no seed (`db.devolutivas`)

## Arquivos a modificar
| Arquivo | Ação |
|---------|------|
| `src/app/api/home/relatorio/route.ts` | Criar |
| `src/app/professor/page.tsx` | Adicionar fetch + componente `RelatorioGeral` ao final |
