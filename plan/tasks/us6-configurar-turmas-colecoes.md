---
status: done
delivery-date: "2026-04-10"
---

# Task: us6-configurar-turmas-colecoes

## Escopo
- **Tipo**: Front-end (FE)
- **Componente**: seção "Turmas e frequência" — estado preenchido — dentro de `/gestor/configurar`
- **Arquivo sugerido**: `src/components/configurar/TurmasFrequencia.tsx` (mesmo componente da task `us6-configurar-turmas-empty`, modo preenchido)

## Objetivo
Implementar o estado preenchido da seção "Turmas e frequência": após o gestor selecionar turmas no drawer, cada turma aparece como um grupo de inputs onde é possível configurar a coleção e o professor responsável, além de poder remover a turma da seleção.

## Design Specs
- Seção preenchida: @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=37-3432&m=dev
- Use a skill `figma-implement` para extrair layout do card de turma, espaçamento entre grupos, tipografia, estilo dos selects e dos botões de remoção antes de codificar.

## Entregáveis

### Layout do estado preenchido
- Substitui o empty state: lista de cards/grupos, um por turma selecionada.
- Botão **"Adicionar turmas"** permanece visível no topo ou rodapé da seção para que o gestor possa abrir o drawer e adicionar mais turmas.

### Card de turma
Cada turma selecionada renderiza um grupo com:

- **Nome da turma** — exibido como label/heading do grupo (não editável).
- **Quantidade de estudantes** — exibido como informação secundária (vem do seed/API, não editável).
- **Select "Coleção"** — opções fixas:
  - "Material didático"
  - "Material didático + Pratique Redação"
  - Valor padrão: vazio (obrigatório selecionar para validar o formulário).
- **Select "Professor"** — lista os professores disponíveis pelo nome. Vem de `GET /api/configuracao` ou seed. Valor padrão: vazio (obrigatório selecionar para validar o formulário).
- **Botão "Remover"** — remove a turma da seleção. Ao remover:
  - O grupo some da lista.
  - Se a coleção removida não está mais associada a nenhuma outra turma, ela desaparece das seções "Liberação de atividades" e "Devolutiva do apoio inteligente".
  - Se todas as turmas forem removidas, a seção volta ao empty state.

### Tipagem do estado por turma
```ts
interface TurmaConfig {
  id: string;
  nome: string;
  totalEstudantes: number;
  colecao: '' | 'material_didatico' | 'material_didatico_pratique';
  professorId: string;
}
```

### Validação por turma
- Um card de turma é considerado **válido** quando `colecao !== ''` e `professorId !== ''`.
- A seção inteira é válida quando todas as turmas adicionadas estão válidas e há ao menos uma turma.
- A validade propaga para o estado central de `page.tsx` para controle do botão "Salvar".

### Coleções ativas (derivadas)
- A lista de coleções únicas selecionadas nas turmas deve ser derivada e exposta para as seções "Liberação de atividades" e "Devolutiva do apoio inteligente":
  ```ts
  const colecoesAtivas: string[] = [...new Set(turmas.map(t => t.colecao).filter(Boolean))];
  ```

## Critérios de pronto
- [ ] Após seleção no drawer, cada turma aparece como um grupo de inputs.
- [ ] Nome e quantidade de estudantes exibidos corretamente para cada turma.
- [ ] Select de coleção tem as duas opções corretas e é obrigatório.
- [ ] Select de professor lista professores do seed/API e é obrigatório.
- [ ] Botão "Remover" elimina a turma da lista e atualiza as seções dependentes.
- [ ] Removendo todas as turmas, seção volta ao empty state.
- [ ] Botão "Adicionar turmas" disponível para abrir o drawer novamente.
- [ ] Validade da seção propaga corretamente para o botão "Salvar".
- [ ] Visual fiel ao Figma (layout do card, selects, botão de remoção, espaçamentos).
