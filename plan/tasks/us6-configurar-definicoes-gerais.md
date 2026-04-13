---
status: done
delivery-date: "2026-04-10"
---

# Task: us6-configurar-definicoes-gerais

## Escopo
- **Tipo**: Front-end (FE)
- **Componente**: seção "Definições gerais" dentro de `/gestor/configurar`
- **Arquivo sugerido**: `src/components/configurar/DefinicoesGerais.tsx`

## Objetivo
Implementar a seção "Definições gerais" da tela de configuração do laboratório. Contém um datepicker para o gestor definir a data de início do laboratório de redação na escola.

## Design Specs
- Seção: @https://www.figma.com/design/vpzLKRxOEyevThhXA8HAGE/Lab-reda%C3%A7%C3%A3o?node-id=403-36707&m=dev
- Use a skill `figma-implement` para extrair layout, tipografia, espaçamento e estilo do card antes de codificar.

## Entregáveis

### Estrutura visual
- Card com título da seção "Definições gerais" (extrair tamanho e peso do Figma).
- Label e campo de datepicker para "Data de início do laboratório".
- Descrição auxiliar abaixo do campo explicando o que essa data representa.

### Regras de negócio do datepicker
- **Só permite selecionar datas futuras**: datas anteriores ou iguais a hoje devem estar desabilitadas (`min={tomorrow}`).
- **Após salvo**: se a data salva já passou (tornou-se passada), o campo deve ficar em modo somente-leitura — exibe o valor mas não permite alteração. Exibir indicativo visual de "bloqueado" (ex.: ícone de cadeado ou campo com fundo cinza).
- **Enquanto a data salva ainda é futura**: campo permanece editável normalmente.
- A lógica de bloqueio deve comparar a data salva com `new Date()` no momento da renderização.

### Integração com estado do formulário
- O componente recebe `value: string` e `onChange: (v: string) => void` como props, alimentando o estado central de `page.tsx`.
- Expõe `isValid: boolean` — verdadeiro quando há uma data futura selecionada.

### Persistência
- Ao carregar a página, buscar a configuração existente via `GET /api/configuracao` e pré-preencher o campo caso já exista `dataInicio`.

## Critérios de pronto
- [ ] Campo de data só aceita datas futuras (datas passadas não selecionáveis).
- [ ] Se data já salva é passada, campo fica somente-leitura com indicativo visual.
- [ ] Se data salva ainda é futura, campo permanece editável.
- [ ] Valor propaga corretamente para o estado central (botão "Salvar" reflete o preenchimento).
- [ ] Visual fiel ao Figma (layout, tipografia, espaçamento, estilo do campo).
