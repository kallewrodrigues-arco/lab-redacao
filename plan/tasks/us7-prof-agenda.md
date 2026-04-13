---
status: done
delivery-date: "2026-04-08"
---

# Task: us7-prof-agenda

## Escopo
- **Tipo**: Front-end (FE)
- **Rota**: `/professor/propostas`
- **Arquivo**: `src/app/professor/propostas/page.tsx`

## Objetivo
Implementar a tela de gestão de agenda do professor: visualizar propostas agrupadas por semana, filtrar, alterar datas (unitário e em lote via drawer) e descartar propostas (unitário e em lote).

## Design Specs
- Tela: @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=37-9542&m=dev

---

## O que foi implementado

### Layout geral
- Fundo `var(--bg-secondary)`, conteúdo centralizado com `maxWidth: 1128`.
- **Header sticky** (`position: sticky; top: 0; z-index: 10`): seta de voltar (← `/professor`), título "Agenda de propostas", área de ações contextuais à direita.
- **Área de filtros** no topo do conteúdo.
- **Lista semanal** abaixo dos filtros.

### Agrupamento por semana
- Propostas agrupadas por semana (segunda-feira da semana como chave).
- Semana corrente destacada: label em azul (`var(--text-active)`), borda superior `2px solid var(--icon-active)`.
- Semanas passadas/futuras: cor `var(--text-caption)`, borda `1px solid`.
- Rótulo da semana: dia (32px/600) + mês abreviado em PT (ex: "07 Abr").
- Propostas dentro da mesma semana empilhadas com bordas colapsadas e border-radius composto (primeiro item arredonda topo, último arredonda base).

### Status computado por proposta
Cada proposta recebe um status calculado em tempo real (não vem da API):

| Status | Condição | Label exibido |
|---|---|---|
| `oculto` | `dataAgendada > hoje` | "Oculto até DD/MM" |
| `visivel` | `dataAgendada <= hoje` e semana atual | "Visível em DD/MM" |
| `atrasada` | `dataAgendada < segunda-feira atual` | "Atrasada" |
| `correcoes_pendentes` | há redações `aguardando_liberacao` | "Falta corrigir" |
| `corrigida` | todas as redações estão `corrigida` | "Corrigida" |
| `descartada` | `p.status === 'descartada'` | "Descartada" |

- Estatísticas de redações (`pendentes`, `corrigidas`, `total`) carregadas de `GET /api/redacoes` e indexadas por `propostaId` no client.
- Status exibido com ponto colorido (6px) + texto.

### Filtros
Três controles em chips/selects no topo:

1. **Coleção** — `<select>` com "Todas as coleções" + opções derivadas dos nomes base das coleções (ex: "Pratique Redação", "Livro I").
2. **Período** — `<select>` com:
   - `Próximas` → só propostas com `dataAgendada >= segundaFeira atual`
   - `Todas` → sem filtro de data
   - `Escolher período` → exibe dois `<input type="date">` ("De" / "até") para intervalo livre
3. **Status** — multi-select com dropdown customizado (checkboxes), opções: Visível, Oculto, Atrasada, Falta corrigir, Corrigida, Descartada. Label do botão resume a seleção ("Qualquer status" / nome único / "X, Y +N"). Botão "Limpar filtro" aparece quando há seleção.

#### Filtros pré-aplicados via URL params
A página lê `?origem=` na inicialização:
- `?origem=proximas` → período = Próximas, status = {visível, oculto, descartada}
- `?origem=pendentes` → período = Todas, status = {correcoes_pendentes}
- `?origem=corrigidas` → período = Todas, status = {corrigida}

### Ações unitárias (modo normal)
Cada item da lista exibe dois botões de ícone no lado direito:

- **Alterar data** (ícone calendário): abre o drawer lateral com aquela proposta pré-carregada.
- **Descartar** (ícone lixeira): chama `PATCH /api/propostas/:id { status: 'descartada' }` imediatamente. Oculto quando a proposta já está descartada (só o calendário aparece para "Agendar").

### Modo de seleção em lote
- Botão **"Selecionar"** no header ativa o modo de seleção.
- Em modo de seleção: drag handle é substituído por checkbox; click no item seleciona/deseleciona.
- Header muda para: **"Cancelar"** + **"Descartar (N)"** + **"Alterar datas (N)"** (botões habilitados só quando `selected.size > 0`).
- **Descarte em lote**: `PATCH /api/propostas/:id { status: 'descartada' }` em paralelo para todos os selecionados.
- **Alterar datas em lote**: abre o drawer com todas as propostas selecionadas, cada uma com seu próprio `<input date>`.

### Drag and drop (reordenação/reagendamento)
- Cada item é `draggable={true}` (desabilitado em modo de seleção).
- Drag só inicia se o `pointerdown` ocorreu no handle (variável de módulo `canDragId` evita drag acidental ao clicar no item).
- Zona de drop: cada bloco semanal recebe `onDragOver` / `onDragLeave` / `onDrop`.
- Drop outline: `2px dashed var(--border-active)` na semana-alvo enquanto o item está sendo arrastado sobre ela.
- Ao soltar: `PATCH /api/propostas/:id { dataAgendada: mondayStr }` → atualiza localmente sem re-fetch.
- Item sendo arrastado fica com `opacity: 0.4`.

### Drawer "Alterar datas"
- Painel lateral direito (400px), overlay escurecido clicável para fechar.
- Header: "Alterar datas" + botão ✕.
- Corpo scrollável: uma linha por proposta com nome da coleção (cor), título e `<input type="date">` pré-preenchido com a segunda-feira da semana atual da proposta.
- Confirmar: faz PATCH para cada proposta com nova data; se proposta estava descartada, reabre (`status: 'agendada'`). Fecha drawer e limpa seleção.

### Navegação inteligente por status
Click em um item (fora do modo de seleção) navega para `/professor/propostas/:id?aba=`:
- `resultados` → se status for `corrigida`
- `correcao` → se status for `correcoes_pendentes` ou `visivel`
- `proposta` → nos demais casos

---

## Critérios de pronto verificados

- [x] Professor consegue visualizar todas as propostas agrupadas por semana, com semana atual destacada
- [x] Filtros de coleção, período e status funcionam em combinação
- [x] Filtros pré-aplicados via URL param (`?origem=`) funcionam
- [x] Status de cada proposta é calculado corretamente (oculto / visível / atrasada / falta corrigir / corrigida / descartada)
- [x] Alterar data unitário via drawer funciona e persiste via PATCH
- [x] Alterar data em lote via drawer funciona para múltiplas propostas simultaneamente
- [x] Descartar proposta unitário funciona e persiste via PATCH
- [x] Descartar em lote funciona para múltiplas propostas simultaneamente
- [x] Drag and drop reagenda proposta para a semana alvo com feedback visual (outline dashed)
- [x] Modo de seleção alterna drag handle por checkbox; botões do header atualizam dinamicamente
- [x] Click em proposta navega para a aba correta conforme status
