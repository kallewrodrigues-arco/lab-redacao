---
status: done
delivery-date: "2026-04-10"
---

# Task: us6-configurar-liberacao-atividades

## Escopo
- **Tipo**: Front-end (FE)
- **Componente**: seção "Liberação de atividades" dentro de `/gestor/configurar`
- **Arquivo sugerido**: `src/components/configurar/LiberacaoAtividades.tsx`

## Objetivo
Implementar a seção "Liberação de atividades" da tela de configuração. O gestor define, para cada coleção ativa, se a liberação das atividades para os alunos é automática (baseada na data de visibilidade definida pelo backoffice) ou manual (exige ação do professor).

## Design Specs
- Seção: @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=406-37081&m=dev
- Use a skill `figma-implement` para extrair layout, tipografia, espaçamento, estilo dos radio buttons e separadores de coleção antes de codificar.

## Entregáveis

### Estrutura visual
- Card com título da seção "Liberação de atividades" e, se houver, descrição auxiliar (extrair do Figma).
- Um bloco de radio buttons por coleção ativa, com:
  - Nome da coleção como label/heading do bloco e imagem de coleção.
  - Dois radio buttons:
    - **"Automático"** — descrição: liberação ocorre automaticamente na data de visibilidade definida pelo backoffice.
    - **"Manual"** — descrição: o professor precisa liberar manualmente cada atividade.
  - Extrair labels e descrições complementares dos radio buttons diretamente do Figma.
- Separador visual entre blocos de coleções diferentes (extrair do Figma).

### Renderização condicional por coleção
- Esta seção **só exibe** coleções que estiverem associadas a ao menos uma turma na seção "Turmas e frequência".
- A lista de coleções ativas é derivada do estado central (`colecoesAtivas: string[]`).
- Se nenhuma coleção estiver ativa (nenhuma turma configurada), a seção pode exibir um estado vazio ou simplesmente não renderizar os blocos.
- Quando uma turma é removida e sua coleção deixa de estar ativa, o bloco correspondente desaparece desta seção.

### Mapeamento de coleções para exibição
```ts
const COLECAO_LABELS: Record<string, string> = {
  'material_didatico': 'Material didático',
  'material_didatico_pratique': 'Pratique Redação',
};
```
> Nota: se ambas as coleções forem selecionadas (via "Material didático + Pratique Redação"), exibir dois blocos separados — um para cada coleção.

### Integração com estado do formulário
- Props:
  ```ts
  interface LiberacaoAtividadesProps {
    colecoesAtivas: string[];
    value: Record<string, 'automatico' | 'manual'>;
    onChange: (v: Record<string, 'automatico' | 'manual'>) => void;
  }
  ```
- A seção é válida quando todas as coleções ativas têm um valor selecionado (`value[colecao] !== undefined`).
- Validade propaga para o estado central para controle do botão "Salvar".

## Critérios de pronto
- [ ] Seção exibe um bloco de radio buttons por coleção ativa.
- [ ] Coleções não ativas (sem turma associada) não são exibidas.
- [ ] Ao remover turma que era a única com determinada coleção, o bloco some.
- [ ] Seleção de "Automático" ou "Manual" persiste no estado central.
- [ ] Seção inválida (coleção ativa sem seleção) bloqueia o botão "Salvar".
- [ ] Visual fiel ao Figma (radio buttons, descrições, separadores, tipografia, espaçamento).
