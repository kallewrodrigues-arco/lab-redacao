---
status: done
delivery-date: "2026-04-10"
---

# Task: us6-configurar-turmas-empty

## Escopo
- **Tipo**: Front-end (FE)
- **Componente**: seção "Turmas e frequência" — estado vazio — dentro de `/gestor/configurar`
- **Arquivo sugerido**: `src/components/configurar/TurmasFrequencia.tsx`

## Objetivo
Implementar o estado vazio da seção "Turmas e coleções" da tela de configuração. Esta é a primeira visualização que o gestor vê antes de selecionar qualquer turma: apenas o header da seção e um botão para abrir o drawer de seleção.

## Design Specs
- Seção (empty state): @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=406-37384&m=dev
- Use a skill `figma-implement` para extrair layout, tipografia, espaçamento, estilo do botão e do card antes de codificar.

## Entregáveis

### Estrutura visual (empty state)
- Card com título da seção "Turmas e coleções" e, se houver, subtítulo ou descrição auxiliar (extrair do Figma).
- Área central de empty state: ilustração ou ícone (extrair do Figma), texto explicativo convidando o gestor a adicionar turmas.
- Botão **"Adicionar turmas"** (estilo e label conforme Figma) que, ao ser clicado, dispara a abertura do drawer de seleção de turmas (implementado em task separada).

### Estado do componente
- O componente `TurmasColecoes` deve alternar entre dois modos:
  - **Empty** (esta task): nenhuma turma selecionada ainda → exibe apenas o titulo da sessão com botão.
  - **Preenchido** (task `us6-configurar-turmas-colecoes`): há turmas selecionadas → exibe os grupos de inputs por turma.
- A transição entre modos é controlada pela lista de turmas selecionadas recebida via props.

### Props esperadas
```ts
interface TurmasFrequenciaProps {
  turmasSelecionadas: TurmaConfig[];
  onOpenDrawer: () => void;        // dispara abertura do drawer
  onChange: (turmas: TurmaConfig[]) => void;
}
```

### Integração com estado do formulário
- Enquanto `turmasSelecionadas.length === 0`, a seção contribui com `isValid: false` para o estado central, mantendo o botão "Salvar" desabilitado.

## Critérios de pronto
- [ ] Empty state renderiza corretamente quando não há turmas selecionadas.
- [ ] Botão "Adicionar turmas" está presente e dispara `onOpenDrawer` ao ser clicado.
- [ ] Componente alterna para o modo preenchido quando `turmasSelecionadas.length > 0` (integração com próximas tasks).
- [ ] Visual fiel ao Figma (ícone/ilustração, tipografia, espaçamento, estilo do botão).
