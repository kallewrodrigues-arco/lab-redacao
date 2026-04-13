---
status: done
delivery-date: "2026-04-10"
---

# Task: us6-configurar-shell

## Escopo
- **Tipo**: Front-end (FE)
- **Rota**: `/gestor/configurar`
- **Arquivo**: `src/app/gestor/configurar/page.tsx`

## Objetivo
Implementar a estrutura geral (shell) da tela "Configurar laboratório de redação". A tela contém 3 seções que agrupam inputs de formulário e uma bottom-bar fixa com botão primário "Salvar" que só é habilitado quando todos os campos obrigatórios estiverem preenchidos.

## Design Specs
- Tela completa: @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=403-36702&m=dev
- Use a skill `figma-implement` para extrair tokens, espaçamentos, tipografia e estrutura do frame antes de codificar.

## Entregáveis

### Layout da página
- Header com breadcrumb "← Laboratório de redação" linkando para `/gestor`, título "Configurar laboratório de redação".
- Área de conteúdo scrollável com `maxWidth` alinhado ao restante do sistema, fundo `var(--bg-secondary)`.
- As 3 seções de formulário empilhadas verticalmente com espaçamento consistente entre elas:
  1. **Definições gerais** (placeholder — implementada em task separada)
  2. **Turmas e frequência** (placeholder — implementada em task separada)
  3. **Liberação de atividades** (placeholder — implementada em task separada)
  4. **Devolutiva do apoio inteligente** (placeholder — implementada em task separada)
- Cada seção renderizada como card branco com borda, border-radius e padding extraídos do Figma.

### Bottom-bar
- Barra fixa no rodapé da tela (`position: sticky; bottom: 0`), fundo branco, borda superior.
- Contém o botão primário **"Salvar"**:
  - **Desabilitado** (cinza, `cursor: not-allowed`) enquanto nem todos os campos obrigatórios estiverem preenchidos.
  - **Habilitado** (cor primária) quando todos os campos obrigatórios tiverem valor.
- A lógica de habilitação deve ser conectável às seções filhas via estado compartilhado (context, prop drilling ou estado no page).

### Estado de formulário
- Criar um estado central em `page.tsx` que agrega o preenchimento de cada seção:
  ```ts
  interface ConfigFormState {
    dataInicio: string;           // seção 1
    turmas: TurmaConfig[];        // seção 2
    liberacaoAtividades: Record<string, 'automatico' | 'manual'>; // seção 3
    liberacaoDevolutiva: Record<string, 'automatico' | 'manual'>; // seção 4
  }
  ```
- Botão "Salvar" habilitado quando: `dataInicio` preenchida + ao menos uma turma configurada (com coleção e professor selecionados) + todas as coleções ativas com liberação definida.
- Ao salvar: chamar `PUT /api/configuracao` com o payload consolidado e exibir feedback (ex.: toast ou redirecionamento).

## Critérios de pronto
- [ ] Tela renderiza em `/gestor/configurar` com header, 3+ seções placeholder e bottom-bar.
- [ ] Bottom-bar é sticky ao scroll.
- [ ] Botão "Salvar" aparece desabilitado no estado inicial (formulário vazio).
- [ ] Botão "Salvar" habilita quando todos os campos obrigatórios estiverem preenchidos.
- [ ] Visual fiel ao Figma (espaçamentos, tipografia, cores).
