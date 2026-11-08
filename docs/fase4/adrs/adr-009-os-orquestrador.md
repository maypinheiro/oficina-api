# ADR-009 — OS Service como orquestrador

- Estado: aceita
- Data: 2026-11-07

## Decisão

O OS Service mantém a máquina de estados da Saga, envia comandos e interpreta
eventos. Ele não executa regras internas de Billing ou Execution.

## Consequências

Existe um ponto explícito de coordenação e auditoria. O serviço exige alta
disponibilidade e retomada segura, mas a jornada fica mais simples de observar,
testar e compensar do que em coreografia pura.
