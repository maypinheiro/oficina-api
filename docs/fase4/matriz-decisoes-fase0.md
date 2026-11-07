# Matriz de decisões e saída da Fase 0

## Decisões

| Item | Estado | Decisão/evidência |
|---|---|---|
| Limites dos serviços | Fechado | [RFC-006](rfc-006-divisao-microservicos.md) |
| Orquestração/coreografia | Fechado | [RFC-007](rfc-007-saga-orquestrada.md) |
| Orquestrador | Fechado | [ADR-009](adrs/adr-009-os-orquestrador.md) |
| Mensageria | Fechado | SNS/SQS/DLQ e [ADR-011](adrs/adr-011-sns-sqs-dlq.md) |
| Bancos | Fechado | PostgreSQL OS/Billing e DynamoDB Execution |
| Isolamento | Fechado | [Ownership de dados](ownership-dados.md) |
| Consistência | Fechado | Outbox + idempotência + [ADR-010](adrs/adr-010-outbox-idempotencia.md) |
| Caminho feliz | Fechado | [Saga orquestrada](saga-orquestrada.md) |
| Compensações | Fechado | matriz de compensações e fluxo demonstrável |
| Contratos iniciais | Fechado | [Catálogo de mensagens](catalogo-mensagens.md) |
| Observabilidade | Fechado | correlation/saga/message IDs e Datadog |
| Pagamento | Fechado | porta com Mercado Pago e mock |
| Cluster | Fechado | EKS compartilhado e namespaces por serviço |

## Decisões de implementação que não reabrem a arquitetura

Podem ser refinadas na fase de construção:

- tempos numéricos de timeout e backoff por ambiente;
- nomes físicos/ARNs de tópicos e filas;
- chaves e GSIs exatos do DynamoDB após detalhar consultas;
- formato final dos schemas JSON;
- estratégia operacional de limpeza da Outbox/Inbox;
- instâncias RDS distintas ou databases isolados no mesmo RDS acadêmico.

## Critérios de saída

- [x] três serviços e responsabilidades definidos;
- [x] diagrama de componentes definido;
- [x] caminho feliz da Saga definido;
- [x] fluxo de compensação definido;
- [x] operações reversíveis diferenciadas de simples tratamento de erro;
- [x] ownership dos dados definido;
- [x] comandos e eventos iniciais catalogados;
- [x] retry, idempotência, DLQ e replay definidos;
- [x] RFCs e ADRs aceitos;
- [x] limitações do AWS Academy consideradas;
- [ ] revisão/aprovação formal do grupo;

## Gate para iniciar a Fase 1

A implementação pode iniciar após o grupo revisar e aprovar este pacote. Mudança
em limites de serviço, dono de dado, orquestrador ou semântica principal da Saga
deve gerar nova decisão arquitetural antes de alterar código.
