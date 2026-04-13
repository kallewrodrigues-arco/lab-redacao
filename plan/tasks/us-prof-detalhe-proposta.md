---
status: done
delivery-date: "2026-04-09"
---

# Task: us-prof-detalhe-proposta

## Escopo
- **Tipo**: Front-end (FE)

## Objetivo
Implementar o shell da página de detalhe de proposta do professor — rota, header com abas e **Aba Proposta** completa (sidebar com 4 sub-itens + visualizador de conteúdo). As abas Correção e Resultados são scaffolded (renderizam placeholder) para que a navegação já funcione; o conteúdo delas é entregue nas tarefas seguintes.

## Design Specs

### Estrutura geral da página
- **Rota base**: `/professor/propostas/[id]`
- **Header**: botão voltar (`←`) + título da proposta truncado + tabs `Proposta | Correção | Resultados`
- **Chip de status**: "Oculto até DD/MM" (azul) ou "Visível em DD/MM" (verde), exibido na Aba Proposta

A navegação entre abas pode ser implementada via query param `?aba=proposta|correcao|resultados` ou sub-rotas (`/correcao`, `/resultados`). Default: Aba Proposta.

---

## Aba Proposta
**Figma**: `@https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-16603&m=dev`
**Rota**: `/professor/propostas/[id]` (tab ativa: Proposta)

### Layout
- **Sidebar esquerda** (fixa, ~180px) com dois grupos:
  - **Para o docente**
    - Manual pedagógico ← sub-item ativo por default (node `40:16603`)
    - Proposta de redação (node `40:16618`)
  - **Para o estudante**
    - Material de apoio (node `40:17364`)
    - Proposta de redação
- **Área de conteúdo principal**: exibe o documento/mídia selecionado na sidebar

### Sub-telas da Aba Proposta

#### Grupo "Para o docente"
##### Manual pedagógico (default) — node `40:16603`
- Visualizador de PDF com multiplas páginas e função de paginação e zoom
- Figma: `@https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-16603&m=dev`

##### Proposta de redação — node `40:16618`
- Visualizador de PDF como já descrito
- Figma: `@https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-16618&m=dev`

#### Grupo "Para o estudante"
##### Material de apoio — node `40:17364`
- Player de vídeo com thumbnail, barra de progresso e controles: play, volume, configurações, legendas, tela cheia
- Figma: `@https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=40-17364&m=dev`

##### Proposta de redação
- Visualizador de PDF como já descrita

---

## Entregáveis
- [x] Rota `/professor/propostas/[id]/page.tsx` com navegação por abas (query param ou sub-rota)
- [x] Header: botão voltar + título truncado + tabs + chip de status
- [x] Aba Proposta: sidebar com 4 sub-itens + visualizador de conteúdo (doc/vídeo) por sub-item
- [x] Abas Correção e Resultados implementadas (além do placeholder inicial)

## Critérios de pronto
- Navegar para `/professor/propostas/[id]` renderiza a página com as 3 tabs no header
- Clicar nas tabs troca a aba ativa (Correção e Resultados mostram placeholder)
- Aba Proposta exibe os 4 sub-itens na sidebar e o conteúdo correto ao selecionar cada um
- Chip de status renderiza conforme data da proposta

## Dependências
- Tarefas 3 (rotas), 4 (API propostas)
