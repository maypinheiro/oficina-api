import { PrismaClient, StatusOutbox } from "@prisma/client";
import { createMessageEnvelope } from "../../../shared/messaging/message-envelope";
import { AwsMessageTransport } from "../../../shared/messaging/aws-transport";
import { log } from "../../../shared/observability/logger";

type OutboxPayload = { target: "billing" | "execution"; causationId?: string; data: unknown };
const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export class OutboxPublisher {
  private running = false;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly transport: AwsMessageTransport,
    private readonly queues: { billing: string; execution: string }
  ) {}

  async publishPending(): Promise<number> {
    const now = new Date();
    const messages = await this.prisma.outboxMensagem.findMany({
      where: {
        status: StatusOutbox.PENDENTE,
        OR: [{ proximaTentativaEm: null }, { proximaTentativaEm: { lte: now } }]
      },
      orderBy: { criadoEm: "asc" },
      take: 10
    });

    for (const message of messages) {
      try {
        const payload = message.payload as OutboxPayload;
        const envelope = createMessageEnvelope({
          messageId: message.id,
          messageType: message.tipo,
          messageKind: "command",
          source: "os-service",
          aggregateId: message.aggregateId,
          correlationId: message.correlationId,
          causationId: payload.causationId,
          sagaId: message.sagaId ?? undefined,
          payload: payload.data
        });
        await this.transport.sendCommand(this.queues[payload.target], envelope);
        await this.prisma.outboxMensagem.updateMany({
          where: { id: message.id, status: StatusOutbox.PENDENTE },
          data: { status: StatusOutbox.PUBLICADA, publicadoEm: new Date(), tentativas: { increment: 1 } }
        });
        log("info", "outbox_message_published", { messageId: message.id, messageType: message.tipo, sagaId: message.sagaId, target: payload.target });
      } catch (error) {
        const attempts = message.tentativas + 1;
        await this.prisma.outboxMensagem.update({
          where: { id: message.id },
          data: {
            tentativas: attempts,
            status: attempts >= 5 ? StatusOutbox.FALHOU : StatusOutbox.PENDENTE,
            proximaTentativaEm: new Date(Date.now() + Math.min(30_000, 1000 * 2 ** attempts))
          }
        });
        log("error", "outbox_publish_failed", { messageId: message.id, messageType: message.tipo, attempts, errorType: error instanceof Error ? error.name : "UnknownError" });
      }
    }
    return messages.length;
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    log("info", "outbox_publisher_started");
    while (this.running) {
      const count = await this.publishPending().catch((error) => {
        log("error", "outbox_iteration_failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
        return 0;
      });
      if (this.running) await wait(count > 0 ? 100 : 1000);
    }
  }

  stop(): void { this.running = false; }
}
