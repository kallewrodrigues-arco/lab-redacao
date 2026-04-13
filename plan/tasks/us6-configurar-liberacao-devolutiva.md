---
status: done
delivery-date: "2026-04-10"
---

# Task: us6-configurar-liberacao-devolutiva

## Escopo
- **Tipo**: Front-end (FE)
- **Componente**: seção "Devolutiva do apoio inteligente" dentro de `/gestor/configurar`
- **Arquivo sugerido**: `src/components/configurar/LiberacaoDevolutiva.tsx`

## Objetivo
Implementar a seção "Devolutiva do apoio inteligente" da tela de configuração. O gestor define, para cada coleção ativa, se a devolução da correção da IA ao aluno é automática (assim que a IA corrige, o aluno recebe) ou manual (o professor precisa revisar e liberar antes do aluno receber).

## Design Specs
- Seção: @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=406-37094&m=dev
- Use a skill `figma-implement` para extrair layout, tipografia, espaçamento, estilo dos radio buttons e separadores de coleção antes de codificar.

## Entregáveis

### Estrutura visual
- Card com título da seção "Devolutiva do apoio inteligente" e, se houver, descrição auxiliar (extrair do Figma).
- Um bloco de radio buttons por coleção ativa, com:
  - Nome da coleção como label/heading do bloco.
  - Dois radio buttons:
    - **"Automático"** — descrição: assim que o apoio inteligente (IA) corrige a redação, a devolutiva é disponibilizada diretamente ao aluno.
    - **"Manual"** — descrição: a devolutiva fica retida após a correção da IA e só é liberada após o professor revisar e confirmar.
  - Extrair labels e descrições complementares dos radio buttons diretamente do Figma.
- Separador visual entre blocos de coleções diferentes (extrair do Figma).

### Renderização condicional por coleção
- Esta seção **só exibe** coleções que estiverem associadas a ao menos uma turma na seção "Turmas e frequência".
- A lista de coleções ativas é derivada do estado central (`colecoesAtivas: string[]`), identicamente à seção "Liberação de atividades".
- Quando uma turma é removida e sua coleção deixa de estar ativa, o bloco correspondente desaparece desta seção.

### Mapeamento de coleções para exibição
```ts
const COLECAO_LABELS: Record<string, string> = {
  'material_didatico': 'Material didático',
  'material_didatico_pratique': 'Pratique Redação',
};
```
> Nota: se ambas as coleções forem selecionadas (via "Material didático + Pratique Redação"), exibir dois blocos separados — um para cada coleção. O comportamento é idêntico ao da seção "Liberação de atividades".

### Integração com estado do formulário
- Props:
  ```ts
  interface LiberacaoDevolutivaProps {
    colecoesAtivas: string[];
    value: Record<string, 'automatico' | 'manual'>;
    onChange: (v: Record<string, 'automatico' | 'manual'>) => void;
  }
  ```
- A seção é válida quando todas as coleções ativas têm um valor selecionado (`value[colecao] !== undefined`).
- Validade propaga para o estado central para controle do botão "Salvar".

### Impacto no fluxo de correção
- A escolha feita aqui determina o comportamento do endpoint `PUT /api/configuracao`:
  - `automatico` → após IA corrigir, status da redação vai direto para `corrigida` (devolutiva visível ao aluno).
  - `manual` → após IA corrigir, status da redação vai para `aguardando_liberacao` (professor precisa liberar via tela de correção).
- Este mapeamento deve ser documentado no payload enviado ao `PUT /api/configuracao` para que o back-end aplique a regra corretamente.

## Critérios de pronto
- [ ] Seção exibe um bloco de radio buttons por coleção ativa.
- [ ] Coleções não ativas (sem turma associada) não são exibidas.
- [ ] Ao remover turma que era a única com determinada coleção, o bloco some.
- [ ] Seleção de "Automático" ou "Manual" persiste no estado central.
- [ ] Seção inválida (coleção ativa sem seleção) bloqueia o botão "Salvar".
- [ ] Visual fiel ao Figma (radio buttons, descrições, separadores, tipografia, espaçamento).
- [ ] Payload enviado ao `PUT /api/configuracao` inclui o modo de devolutiva por coleção.
