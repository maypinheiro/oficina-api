import { isTerminalSagaStep, SagaEvent, SagaStep, transitionSaga } from "./saga-machine";

function run(events: SagaEvent[]): SagaStep {
  return events.reduce<SagaStep>((step, event) => transitionSaga(step, event).step, "OS_CREATED");
}

describe("Saga orquestrada da OS", () => {
  it("conclui o caminho feliz", () => {
    expect(run(["StartSaga", "QuoteCreated", "QuoteApproved", "ExecutionStarted", "ExecutionCompleted", "PaymentCreated", "PaymentConfirmed"])).toBe("COMPLETED");
  });

  it("compensa falha de execucao em ordem reversa", () => {
    let step: SagaStep = run(["StartSaga", "QuoteCreated", "QuoteApproved", "ExecutionStarted"]);
    const cancelExecution = transitionSaga(step, "ExecutionFailed");
    expect(cancelExecution).toEqual({ step: "COMPENSATING_EXECUTION", command: "CancelExecution" });
    const cancelQuote = transitionSaga(cancelExecution.step, "ExecutionCancelled");
    expect(cancelQuote.command).toBe("CancelQuoteApproval");
    const compensated = transitionSaga(cancelQuote.step, "QuoteApprovalCancelled");
    expect(compensated.terminal).toBe("COMPENSATED");
  });

  it("falha sem compensacao quando o orcamento nao foi criado", () => {
    expect(run(["StartSaga", "QuoteCreationFailed"])).toBe("FAILED");
  });

  it("mantem a Saga aguardando quando a cobranca pendente e criada", () => {
    expect(transitionSaga("WAITING_PAYMENT", "PaymentCreated")).toEqual({ step: "WAITING_PAYMENT" });
  });

  it("protege estados terminais e transicoes fora de ordem", () => {
    expect(() => transitionSaga("WAITING_QUOTE", "PaymentConfirmed")).toThrow("Transicao de Saga invalida");
    expect(isTerminalSagaStep("COMPLETED")).toBe(true);
    expect(isTerminalSagaStep("IN_EXECUTION")).toBe(false);
  });
});
