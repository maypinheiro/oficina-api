import { PrismaClient } from "@prisma/client";
import { MessageInbox } from "./idempotent-handler";
import { MessageEnvelope } from "./message-envelope";

export class PrismaMessageInbox implements MessageInbox {
  constructor(private readonly prisma: PrismaClient) {}
  async claim(message: MessageEnvelope, hash: string): Promise<boolean> {
    try {
      await this.prisma.inboxMensagem.create({ data: { messageId: message.messageId, tipo: message.messageType, correlationId: message.correlationId, sagaId: message.sagaId, payloadHash: hash } });
      return true;
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return false;
      throw error;
    }
  }
}
