import { assertMessageEnvelope, createMessageEnvelope, parseQueueBody } from "./message-envelope";
import { IdempotentMessageHandler, MessageInbox } from "./idempotent-handler";

const message = () => createMessageEnvelope({
  messageType: "billing.budget.requested",
  messageKind: "command",
  source: "os-service",
  aggregateId: "os-1",
  correlationId: "correlation-1",
  payload: { orderId: "os-1" },
});

describe("contrato de mensageria", () => {
  it("cria e valida o envelope versionado", () => {
    const envelope = message();
    expect(envelope.version).toBe(1);
    expect(parseQueueBody(JSON.stringify(envelope))).toEqual(envelope);
    expect(parseQueueBody(JSON.stringify({ Message: JSON.stringify(envelope) }))).toEqual(envelope);
  });

  it("ignora uma entrega duplicada", async () => {
    const claimed = new Set<string>();
    const inbox: MessageInbox = { claim: async (item) => {
      if (claimed.has(item.messageId)) return false;
      claimed.add(item.messageId);
      return true;
    } };
    const handler = new IdempotentMessageHandler(inbox);
    const action = jest.fn(async () => undefined);
    const envelope = message();
    expect(await handler.handle(envelope, action)).toBe("processed");
    expect(await handler.handle(envelope, action)).toBe("duplicate");
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("rejeita envelopes incompatíveis", () => {
    expect(() => assertMessageEnvelope(null)).toThrow();
    expect(() => assertMessageEnvelope({ messageKind: "event", version: 1, occurredAt: new Date().toISOString(), payload: {} })).toThrow();
    expect(() => assertMessageEnvelope({ ...message(), messageKind: "unknown" })).toThrow();
    expect(() => assertMessageEnvelope({ ...message(), version: 0 })).toThrow();
    expect(() => assertMessageEnvelope({ ...message(), occurredAt: "invalid" })).toThrow();
    const withoutPayload: Record<string, unknown> = { ...message() };
    delete withoutPayload.payload;
    expect(() => assertMessageEnvelope(withoutPayload)).toThrow();
  });
});
