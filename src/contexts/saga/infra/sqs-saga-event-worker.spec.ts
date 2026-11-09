import { SqsSagaEventWorker } from "./sqs-saga-event-worker";

describe("SqsSagaEventWorker", () => {
  it("consome, processa e remove um evento da fila", async () => {
    const envelope = {
      messageId: "event-1", messageType: "QuoteCreated", messageKind: "event", version: 1,
      occurredAt: new Date().toISOString(), source: "billing-service", aggregateId: "order-1",
      correlationId: "correlation-1", sagaId: "saga-1", payload: { quoteId: "quote-1" }
    };
    const client = { send: jest.fn() };
    const orchestrator = { consume: jest.fn() };
    let worker: SqsSagaEventWorker;
    orchestrator.consume.mockImplementation(async () => { worker.stop(); return "processed"; });
    client.send
      .mockResolvedValueOnce({ Messages: [{ Body: JSON.stringify(envelope), ReceiptHandle: "receipt-1" }] })
      .mockResolvedValueOnce({});
    worker = new SqsSagaEventWorker(client as never, "queue-url", orchestrator as never);

    await worker.start();

    expect(orchestrator.consume).toHaveBeenCalledWith(expect.objectContaining({ messageId: "event-1" }));
    expect(client.send).toHaveBeenCalledTimes(2);
  });
});
