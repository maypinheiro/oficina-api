# Fase 4 — Arquitetura e Saga

Este diretório é a fonte central das decisões da Fase 4. A Fase 0 fecha a
arquitetura e o fluxo transacional antes da extração de código do monólito.

## Decisões fechadas

- [Fase 3 — mensageria básica e contratos](fase3-mensageria-basica.md)
- [Fase 4 — Saga orquestrada implementada](fase4-saga-implementada.md)

| Tema | Decisão |
|---|---|
| Serviços de negócio | OS Service, Billing Service e Execution Service |
| Repositórios | Um repositório por serviço; `oficina-api` evolui para OS Service |
| Saga | Orquestrada pelo OS Service |
| Comunicação | REST nas bordas e SNS/SQS para comandos e eventos entre serviços |
| Persistência | PostgreSQL para OS/Billing e DynamoDB para Execution |
| Consistência | Transação local + Transactional Outbox + consumidores idempotentes |
| Entrega | Pelo menos uma vez, com retry, DLQ e replay auditável |
| Cluster | EKS compartilhado, com namespace e infraestrutura por serviço |
| Pagamento | Adapter Mercado Pago e mock acadêmico compatível |
| Observabilidade | Datadog, `correlationId`, `sagaId`, métricas e tracing distribuído |

## Documentos da Fase 0

- [Arquitetura-alvo](arquitetura-alvo.md)
- [Fluxo da Saga orquestrada](saga-orquestrada.md)
- [Catálogo inicial de comandos e eventos](catalogo-mensagens.md)
- [Ownership e isolamento dos dados](ownership-dados.md)
- [Matriz de decisões e critérios de saída](matriz-decisoes-fase0.md)
- [RFC-006 — Divisão dos microsserviços](rfc-006-divisao-microservicos.md)
- [RFC-007 — Saga orquestrada](rfc-007-saga-orquestrada.md)
- [ADRs da Fase 4](adrs/README.md)

## Evolução da implementação

- [Fase 1 — preparação dos repositórios](fase1-preparacao-repositorios.md)
- [Fase 2 — separação dos dados](fase2-separacao-dados.md)

## Estado da Fase 0

As decisões arquiteturais e o fluxo da Saga estão fechados. Nenhum código de
negócio foi extraído nesta fase. Alterações futuras nas decisões aceitas devem
ser registradas por nova RFC/ADR, evitando mudanças silenciosas durante a
implementação.
