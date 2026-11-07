# ADR-010 — Transactional Outbox e consumidores idempotentes

- Estado: aceita
- Data: 2026-11-07

## Decisão

Serviços SQL gravam estado e Outbox na mesma transação. Consumidores registram
`messageId` no banco próprio antes de confirmar a mensagem. No DynamoDB, escrita
condicional garante o mesmo efeito.

## Consequências

Evita perda entre commit e publicação e tolera reentrega. Requer publicador de
Outbox, limpeza/retention, tabela de Inbox e métricas de backlog/duplicidade.
