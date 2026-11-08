# ADR-012 — DynamoDB no Execution Service

- Estado: aceita
- Data: 2026-11-07

## Decisão

Execution utiliza DynamoDB para fila, diagnóstico, andamento, reservas e
idempotência. OS e Billing permanecem relacionais.

## Consequências

O conjunto atende SQL + NoSQL e Execution ganha escala/isolamento. Consultas
devem ser desenhadas antes das chaves e índices; joins não existem. Escritas
condicionais serão usadas em transições e deduplicação.
