---
status: done
delivery-date: "2026-04-07"
---

# Task: wizard-of-oz-admin

## Escopo
- **Tipo**: Back-end (BE)

## Objetivo
Implementar endpoints admin para “Wizard of Oz” que permitam forçar transições de estado e simular edge cases durante o piloto (sem integrações reais).

## Entregáveis
- Endpoints/admin actions para:
  - mover redação entre estados (pendente, corrigindo, aguardando validação, corrigida, rejeitada)
  - marcar “foto ilegível” e solicitar reenvio
  - ajustar tempos simulados (latência IA/OCR) e previsões de devolutiva
  - alternar modo por turma/escola para cenários de teste

## Critérios de pronto
- Operação consegue preparar uma demo em minutos (sem mexer em código/dados manualmente).

