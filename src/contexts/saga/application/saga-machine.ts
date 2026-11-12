export type SagaStep =
  | "OS_CREATED" | "WAITING_QUOTE" | "WAITING_APPROVAL" | "EXECUTION_REQUESTED"
  | "IN_EXECUTION" | "WAITING_PAYMENT" | "COMPENSATING_EXECUTION"
  | "COMPENSATING_QUOTE" | "COMPLETED" | "COMPENSATED" | "FAILED";

export type SagaEvent =
  | "StartSaga" | "QuoteCreated" | "QuoteApproved" | "QuoteRejected"
  | "QuoteCreationFailed" | "ExecutionStarted" | "ExecutionCompleted"
  | "ExecutionFailed" | "ExecutionCancelled" | "QuoteApprovalCancelled"
  | "PaymentCreated" | "PaymentConfirmed" | "PaymentFailed";

export type SagaCommand = "CreateQuote" | "StartExecution" | "CompleteExecution" | "RequestPayment" | "CancelExecution" | "CancelQuoteApproval" | "CancelQuote";

export interface SagaTransition { step: SagaStep; command?: SagaCommand; terminal?: "COMPLETED" | "COMPENSATED" | "FAILED" }

const transitions: Record<SagaStep, Partial<Record<SagaEvent, SagaTransition>>> = {
  OS_CREATED: { StartSaga: { step: "WAITING_QUOTE", command: "CreateQuote" } },
  WAITING_QUOTE: {
    QuoteCreated: { step: "WAITING_APPROVAL" },
    QuoteCreationFailed: { step: "FAILED", terminal: "FAILED" },
  },
  WAITING_APPROVAL: {
    QuoteApproved: { step: "EXECUTION_REQUESTED", command: "StartExecution" },
    QuoteRejected: { step: "COMPENSATING_QUOTE", command: "CancelQuote" },
  },
  EXECUTION_REQUESTED: {
    ExecutionStarted: { step: "IN_EXECUTION" },
    ExecutionFailed: { step: "COMPENSATING_EXECUTION", command: "CancelExecution" },
  },
  IN_EXECUTION: {
    ExecutionCompleted: { step: "WAITING_PAYMENT", command: "RequestPayment" },
    ExecutionFailed: { step: "COMPENSATING_EXECUTION", command: "CancelExecution" },
  },
  WAITING_PAYMENT: {
    PaymentCreated: { step: "WAITING_PAYMENT" },
    PaymentConfirmed: { step: "COMPLETED", terminal: "COMPLETED" },
    PaymentFailed: { step: "FAILED", terminal: "FAILED" },
  },
  COMPENSATING_EXECUTION: { ExecutionCancelled: { step: "COMPENSATING_QUOTE", command: "CancelQuoteApproval" } },
  COMPENSATING_QUOTE: { QuoteApprovalCancelled: { step: "COMPENSATED", terminal: "COMPENSATED" } },
  COMPLETED: {}, COMPENSATED: {}, FAILED: {},
};

export function transitionSaga(current: SagaStep, event: SagaEvent): SagaTransition {
  const transition = transitions[current][event];
  if (!transition) throw new Error(`Transicao de Saga invalida: ${current} + ${event}`);
  return transition;
}

export const isTerminalSagaStep = (step: SagaStep): boolean => ["COMPLETED", "COMPENSATED", "FAILED"].includes(step);
