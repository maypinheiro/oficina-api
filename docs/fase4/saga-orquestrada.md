# Saga orquestrada da ordem de serviço

## Responsável

O OS Service é o orquestrador. Ele persiste a Saga, envia comandos, recebe
eventos e determina avanço, retry, falha ou compensação. Billing e Execution
executam somente transações locais e respondem com eventos.

## Identificadores

| Campo | Uso |
|---|---|
| `sagaId` | identifica a instância da Saga |
| `correlationId` | correlaciona HTTP, mensagens, logs e traces da jornada |
| `messageId` | deduplicação da mensagem |
| `causationId` | aponta para a mensagem que causou a atual |
| `aggregateId` | número/ID da ordem de serviço |

## Caminho feliz

```mermaid
sequenceDiagram
  autonumber
  actor C as Cliente/Funcionário
  participant OS as OS Service
  participant MQ as SNS/SQS
  participant B as Billing Service
  participant E as Execution Service
  participant P as Mercado Pago/Mock

  C->>OS: POST /ordens-servico
  OS->>OS: cria OS + Saga + Outbox
  OS->>MQ: CreateQuote
  MQ->>B: CreateQuote
  B->>B: cria orçamento + Outbox
  B->>MQ: QuoteCreated
  MQ->>OS: QuoteCreated
  OS->>OS: WAITING_APPROVAL

  C->>OS: aprova orçamento pela fachada pública
  OS->>B: POST decisão no Service interno
  B->>B: confirma aprovação + Outbox
  B->>MQ: QuoteApproved
  MQ->>OS: QuoteApproved
  OS->>MQ: StartExecution
  MQ->>E: StartExecution

  E->>E: diagnóstico, reserva e reparo
  E->>MQ: ExecutionStarted / ExecutionCompleted
  MQ->>OS: ExecutionCompleted
  OS->>MQ: RequestPayment
  MQ->>B: RequestPayment
  B->>P: cria cobrança
  P-->>B: paymentId + QR/link
  B->>MQ: PaymentCreated
  P-->>B: webhook confirmado
  B->>MQ: PaymentConfirmed
  MQ->>OS: PaymentConfirmed
  OS->>OS: COMPLETED + OS FINALIZADA
```

## Máquina de estados

```mermaid
stateDiagram-v2
  [*] --> OS_CREATED
  OS_CREATED --> WAITING_QUOTE: CreateQuote
  WAITING_QUOTE --> WAITING_APPROVAL: QuoteCreated
  WAITING_APPROVAL --> EXECUTION_REQUESTED: QuoteApproved / StartExecution
  WAITING_APPROVAL --> COMPENSATING_QUOTE: QuoteRejected / CancelQuote
  EXECUTION_REQUESTED --> IN_EXECUTION: ExecutionStarted
  EXECUTION_REQUESTED --> COMPENSATING_EXECUTION: ExecutionFailed / CancelExecution
  IN_EXECUTION --> WAITING_PAYMENT: ExecutionCompleted / RequestPayment
  IN_EXECUTION --> COMPENSATING_EXECUTION: ExecutionFailed / CancelExecution
  WAITING_PAYMENT --> WAITING_PAYMENT: PaymentCreated
  WAITING_PAYMENT --> COMPLETED: PaymentConfirmed
  WAITING_PAYMENT --> FAILED: PaymentFailed
  COMPENSATING_EXECUTION --> COMPENSATING_QUOTE: ExecutionCancelled / CancelQuoteApproval
  COMPENSATING_QUOTE --> COMPENSATED: QuoteApprovalCancelled
  WAITING_QUOTE --> FAILED: QuoteCreationFailed
  COMPLETED --> [*]
  COMPENSATED --> [*]
  FAILED --> [*]
```

O diagrama acima corresponde aos estados implementados em
`src/contexts/saga/application/saga-machine.ts`. Os estados terminais são
`COMPLETED`, `COMPENSATED` e `FAILED`; eventos incompatíveis com o estado atual
são rejeitados e não alteram a Saga.

## Transações locais e eventos

Cada passo modifica somente o banco do serviço que o executa. Persistência de
estado e registro na Outbox ocorrem na mesma transação local. Um publicador lê a
Outbox e envia a mensagem; a publicação pode repetir, portanto os consumidores
devem deduplicar por `messageId`.

## Política de retry

1. falha transitória: até cinco tentativas com backoff exponencial e jitter;
2. falha de regra de negócio: não repetir automaticamente;
3. mensagem inválida ou tentativas esgotadas: DLQ;
4. o orquestrador decide se a etapa apenas falha ou inicia compensação;
5. replay de DLQ preserva o `messageId` original e registra operador/motivo.

Valores exatos de timeout e backoff serão configuráveis por ambiente. O código
não pode depender de sleeps fixos.

## Matriz de compensações

| Operação confirmada | Falha posterior | Comando compensatório | Resultado esperado |
|---|---|---|---|
| OS criada | orçamento nunca criado | nenhum rollback de negócio | OS marcada `FAILED_QUOTE`; intervenção/reprocessamento possível |
| orçamento criado | cliente rejeita | `CancelQuote` | orçamento cancelado e OS compensada/cancelada |
| orçamento aprovado | execução não inicia | `CancelQuoteApproval` | orçamento reaberto/cancelado e OS compensada |
| recursos reservados | execução falha | `CancelExecution` | reservas liberadas e execução cancelada |
| cobrança criada | cancelamento autorizado | `CancelPayment` | cobrança cancelada |
| pagamento confirmado | cancelamento autorizado | `RefundPayment` | estorno registrado e evento `PaymentRefunded` |

Registrar erro, enviar alerta ou mover mensagem para DLQ é tratamento de falha,
mas não é compensação. A compensação precisa desfazer um efeito de negócio já
confirmado.

## Fluxo de compensação demonstrável

```mermaid
sequenceDiagram
  participant OS as OS Service
  participant MQ as SNS/SQS
  participant B as Billing Service
  participant E as Execution Service

  B->>MQ: QuoteApproved
  MQ->>OS: QuoteApproved
  OS->>MQ: StartExecution
  MQ->>E: StartExecution
  E->>E: reserva recursos
  E-->>MQ: ExecutionFailed (após retries)
  MQ->>OS: ExecutionFailed
  OS->>OS: COMPENSATING
  OS->>MQ: CancelExecution
  MQ->>E: CancelExecution
  E->>E: libera reservas
  E->>MQ: ExecutionCancelled
  OS->>MQ: CancelQuoteApproval
  MQ->>B: CancelQuoteApproval
  B->>MQ: QuoteApprovalCancelled
  MQ->>OS: eventos de compensação concluídos
  OS->>OS: COMPENSATED
```

## Invariantes

- uma OS possui no máximo uma Saga ativa;
- uma transição somente ocorre a partir de estados permitidos;
- evento duplicado não produz efeito duplicado;
- `COMPLETED`, `COMPENSATED` e `FAILED` são terminais;
- compensações são idempotentes e podem ser repetidas;
- nenhum consumidor atualiza o banco de outro serviço;
- toda mudança relevante é auditável por estado, mensagem e data.

## Cenários mínimos de aceite

1. caminho feliz completo até pagamento confirmado;
2. orçamento rejeitado;
3. falha transitória recuperada por retry;
4. falha de execução com liberação de reservas e cancelamento da aprovação;
5. mensagem duplicada sem efeito duplicado;
6. mensagem inválida enviada para DLQ;
7. replay auditável de mensagem da DLQ.
