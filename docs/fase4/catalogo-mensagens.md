# Catálogo inicial de comandos e eventos

## Convenções

- comandos usam verbo no imperativo e representam intenção;
- eventos usam passado e representam fato confirmado;
- nomes técnicos usam inglês de forma consistente;
- `schemaVersion` começa em `1`;
- payload contém somente os dados mínimos do contrato;
- CPF, JWT, segredos e dados de pagamento não entram em mensagens ou logs.

## Envelope

```json
{
  "messageId": "uuid",
  "messageType": "QuoteApproved",
  "schemaVersion": 1,
  "occurredAt": "2026-11-07T12:00:00.000Z",
  "sagaId": "uuid",
  "correlationId": "uuid",
  "causationId": "uuid",
  "aggregateId": "OS-000001",
  "source": "billing-service",
  "payload": {}
}
```

## Comandos

| Comando | Produtor | Consumidor | Finalidade |
|---|---|---|---|
| `CreateQuote` | OS | Billing | criar orçamento da OS |
| `CancelQuote` | OS | Billing | cancelar orçamento |
| `CancelQuoteApproval` | OS | Billing | compensar aprovação |
| `StartExecution` | OS | Execution | colocar OS em diagnóstico/execução |
| `CompleteExecution` | OS | Execution | solicitar conclusão técnica da execução em andamento |
| `CancelExecution` | OS | Execution | cancelar execução e liberar reservas |
| `RequestPayment` | OS | Billing | criar cobrança após conclusão técnica |
| `CancelPayment` | OS | Billing | cancelar cobrança não confirmada |
| `RefundPayment` | OS | Billing | estornar pagamento confirmado |

## Eventos

| Evento | Produtor | Consumidores | Significado |
|---|---|---|---|
| `QuoteCreated` | Billing | OS | orçamento criado |
| `QuoteCreationFailed` | Billing | OS | criação falhou definitivamente |
| `QuoteApproved` | Billing | OS | cliente aprovou |
| `QuoteRejected` | Billing | OS | cliente rejeitou |
| `QuoteCancelled` | Billing | OS | orçamento cancelado |
| `QuoteApprovalCancelled` | Billing | OS | aprovação compensada |
| `ExecutionStarted` | Execution | OS | diagnóstico/execução iniciado |
| `ExecutionProgressed` | Execution | OS | progresso relevante registrado |
| `ExecutionCompleted` | Execution | OS | reparo concluído |
| `ExecutionFailed` | Execution | OS | falha definitiva após retries |
| `ExecutionCancelled` | Execution | OS | reservas liberadas e execução cancelada |
| `PaymentCreated` | Billing | OS | cobrança disponível |
| `PaymentConfirmed` | Billing | OS | pagamento confirmado |
| `PaymentFailed` | Billing | OS | falha/recusa definitiva |
| `PaymentCancelled` | Billing | OS | cobrança cancelada |
| `PaymentRefunded` | Billing | OS | estorno concluído |

## Regras de evolução

- mudanças compatíveis adicionam campos opcionais e mantêm a versão;
- remoção, renomeação ou mudança semântica exige nova versão;
- consumidores ignoram campos desconhecidos;
- produtores não reutilizam um nome para significado diferente;
- exemplos JSON e schemas serão versionados junto ao produtor;
- testes de contrato bloqueiam PR incompatível.

## Filas iniciais

| Fila | Conteúdo | DLQ |
|---|---|---|
| `oficina-os-events` | eventos consumidos pelo OS | `oficina-os-events-dlq` |
| `oficina-billing-commands` | comandos para Billing | `oficina-billing-commands-dlq` |
| `oficina-execution-commands` | comandos para Execution | `oficina-execution-commands-dlq` |

Os nomes físicos receberão prefixo de ambiente e projeto. O catálogo descreve
nomes lógicos e não vincula o domínio a ARNs específicos.

## Escopo implementado e contratos de evolução

Para evitar ambiguidade na avaliação, o catálogo contém tanto o fluxo executado
quanto comandos compensatórios preparados para cenários posteriores:

| Categoria | Situação atual |
|---|---|
| Fluxo HML executado | `CreateQuote`, `QuoteCreated`, `QuoteApproved`, `StartExecution`, `ExecutionStarted`, `CompleteExecution`, `ExecutionCompleted`, `RequestPayment`, `PaymentCreated` e `PaymentConfirmed` |
| Compensação HML executada | `ExecutionFailed`, `CancelExecution`, `ExecutionCancelled`, `CancelQuoteApproval` e `QuoteApprovalCancelled` |
| Participante já suporta | `CancelQuote`, `CancelPayment`, `RefundPayment`, `QuoteCancelled`, `PaymentCancelled` e `PaymentRefunded` |
| Contrato de evolução | `ExecutionProgressed`; será emitido quando apontamentos intermediários forem expostos |

O cenário controlado de falha de HML gera `ExecutionFailed` no orquestrador para
comprovar o rollback de negócio completo. Em operação permanente, mensagens que
esgotam retry ficam na DLQ e exigem replay/ação operacional; automatizar a
conversão de DLQ/timeout em `ExecutionFailed` é uma evolução operacional, não um
acesso ao banco do participante.
