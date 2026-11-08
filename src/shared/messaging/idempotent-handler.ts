import { MessageEnvelope, payloadHash } from "./message-envelope";

export interface MessageInbox {
  claim(message: MessageEnvelope, hash: string): Promise<boolean>;
}

export class IdempotentMessageHandler {
  constructor(private readonly inbox: MessageInbox) {}

  async handle(message: MessageEnvelope, action: (message: MessageEnvelope) => Promise<void>): Promise<"processed" | "duplicate"> {
    const claimed = await this.inbox.claim(message, payloadHash(message));
    if (!claimed) return "duplicate";
    await action(message);
    return "processed";
  }
}
