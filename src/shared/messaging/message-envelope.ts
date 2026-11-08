import { createHash, randomUUID } from "node:crypto";

export const MESSAGE_ENVELOPE_VERSION = 1 as const;

export type MessageKind = "command" | "event";

export interface MessageEnvelope<TPayload = unknown> {
  messageId: string;
  messageType: string;
  messageKind: MessageKind;
  version: number;
  occurredAt: string;
  source: string;
  aggregateId: string;
  correlationId: string;
  causationId?: string;
  sagaId?: string;
  payload: TPayload;
}

export type NewMessage<TPayload> = Omit<MessageEnvelope<TPayload>, "messageId" | "occurredAt" | "version"> & {
  messageId?: string;
  occurredAt?: string;
  version?: number;
};

export function createMessageEnvelope<TPayload>(input: NewMessage<TPayload>): MessageEnvelope<TPayload> {
  const envelope: MessageEnvelope<TPayload> = {
    ...input,
    messageId: input.messageId ?? randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    version: input.version ?? MESSAGE_ENVELOPE_VERSION,
  };
  assertMessageEnvelope(envelope);
  return envelope;
}

export function assertMessageEnvelope(value: unknown): asserts value is MessageEnvelope {
  if (!value || typeof value !== "object") throw new Error("Envelope de mensagem invalido");
  const message = value as Record<string, unknown>;
  const requiredStrings = ["messageId", "messageType", "occurredAt", "source", "aggregateId", "correlationId"];
  if (requiredStrings.some((field) => typeof message[field] !== "string" || message[field] === "")) {
    throw new Error("Envelope de mensagem incompleto");
  }
  if (message.messageKind !== "command" && message.messageKind !== "event") throw new Error("Tipo de mensagem invalido");
  if (!Number.isInteger(message.version) || Number(message.version) < 1) throw new Error("Versao de mensagem invalida");
  if (Number.isNaN(Date.parse(String(message.occurredAt)))) throw new Error("Data da mensagem invalida");
  if (!("payload" in message)) throw new Error("Payload ausente");
}

export function parseQueueBody(body: string): MessageEnvelope {
  const parsed = JSON.parse(body) as Record<string, unknown>;
  const candidate = typeof parsed.Message === "string" ? JSON.parse(parsed.Message) : parsed;
  assertMessageEnvelope(candidate);
  return candidate;
}

export function payloadHash(message: MessageEnvelope): string {
  return createHash("sha256").update(JSON.stringify(message.payload)).digest("hex");
}
