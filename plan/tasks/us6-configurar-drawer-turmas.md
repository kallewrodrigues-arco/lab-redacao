---
status: done
delivery-date: "2026-04-10"
---

# Task: us6-configurar-drawer-turmas

## Escopo
- **Tipo**: Front-end (FE)
- **Componente**: Drawer de seleção de turmas dentro de `/gestor/configurar`
- **Arquivo sugerido**: `src/components/configurar/DrawerSelecaoTurmas.tsx`

## Objetivo
Implementar o drawer lateral de seleção de turmas. O drawer abre à direita, cobrindo parcialmente o conteúdo principal e com um backdrop, e exibe a lista de turmas disponíveis agrupadas por série. O gestor seleciona as turmas desejadas via checkboxes e confirma a seleção.

## Design Specs
- Drawer: @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=37-5515&m=dev
- Use a skill `figma-implement` para extrair largura do drawer, cores, tipografia, espaçamento, estilo dos checkboxes e do botão antes de codificar.

## Entregáveis

### Comportamento do drawer
- Abre deslizando da direita (`position: fixed`, lado direito da viewport).
- Cobre **parcialmente** o conteúdo principal — o conteúdo à esquerda permanece visível (sem overlay de tela cheia). Extrair a largura exata do Figma.
- Overlay semitransparente à esquerda do drawer para indicar foco; clique no overlay fecha o drawer **sem** salvar a seleção.
- Botão ✕ no header do drawer também fecha sem salvar.
- Fechar sem confirmar descarta qualquer seleção feita dentro do drawer naquela abertura (não persiste).

### Header do drawer
- Título "Selecionar turmas" (ou conforme Figma).
- Botão de fechar (ícone ✕) alinhado à direita.

### Lista de turmas
- Turmas agrupadas por **série** (ex.: "1º ano", "2º ano", "3º ano") — extrair estilo dos separadores de grupo do Figma. As turmas devem ser as que constam na base de dados.
- Cada item: checkbox + nome da turma.
- Turmas já adicionadas à configuração (já presentes em `turmasSelecionadas`) devem aparecer marcadas e habilitadas (podendo ser desmarcadas pelo drawer).
- Turmas disponíveis vêm de `GET /api/configuracao` ou de dados seed do sistema.

### Rodapé do drawer
- Botão **"Concluir"**:
  - **Desabilitado** enquanto nenhuma turma nova (além das já adicionadas) estiver selecionada.
  - **Habilitado** ao selecionar ao menos uma turma nova.
  - Ao clicar: chama `onConfirm(turmasSelecionadas)` com a lista atualizada e fecha o drawer.

### Props esperadas
```ts
interface DrawerSelecaoTurmasProps {
  open: boolean;
  turmasJaAdicionadas: string[];      // ids das turmas já na configuração
  onConfirm: (turmaIds: string[]) => void;
  onClose: () => void;
}
```

### Dados das turmas
- Buscar lista de turmas disponíveis via `GET /api/configuracao` (campo `turmasDisponiveis`) ou extrair do seed.
- Cada turma deve ter: `id`, `nome`, `serie` (para agrupamento).

## Critérios de pronto
- [ ] Drawer abre à direita e cobre parcialmente o conteúdo principal.
- [ ] Turmas exibidas agrupadas por série com separadores visuais.
- [ ] Turmas já adicionadas aparecem marcadas e desabilitadas.
- [ ] Botão "Concluir" desabilitado sem nova seleção; habilitado com ao menos uma nova turma marcada.
- [ ] Ao confirmar, `onConfirm` é chamado com os ids selecionados e drawer fecha.
- [ ] Fechar (✕ ou overlay) descarta seleção sem persistir.
- [ ] Visual fiel ao Figma (largura, tipografia, espaçamento, estilo de checkboxes e botão).
