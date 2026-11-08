import { Prisma, PrismaClient, StatusSaga } from "@prisma/client";
import { MessageEnvelope } from "../../../shared/messaging/message-envelope";
import { SagaCommand, SagaEvent, SagaStep, transitionSaga } from "../application/saga-machine";

const statusByStep = (step: SagaStep): StatusSaga => {
  if (step === "COMPLETED") return StatusSaga.CONCLUIDA;
  if (step === "COMPENSATED") return StatusSaga.COMPENSADA;
  if (step === "FAILED") return StatusSaga.FALHOU;
  if (step.startsWith("COMPENSATING")) return StatusSaga.COMPENSANDO;
  if (["WAITING_QUOTE", "WAITING_APPROVAL", "WAITING_PAYMENT"].includes(step)) return StatusSaga.AGUARDANDO_EVENTO;
  return StatusSaga.EM_ANDAMENTO;
};

const commandTarget = (command: SagaCommand): "billing" | "execution" =>
  ["StartExecution", "CancelExecution"].includes(command) ? "execution" : "billing";

export class PrismaSagaOrchestrator {
  constructor(private readonly prisma: PrismaClient) {}

  async start(orderId: string, correlationId: string, payload: Prisma.InputJsonValue): Promise<string> {
    const result = transitionSaga("OS_CREATED", "StartSaga");
    return this.prisma.$transaction(async (tx) => {
      const saga = await tx.sagaInstancia.create({ data: { ordemServicoId: orderId, correlationId, etapaAtual: result.step, status: statusByStep(result.step) } });
      await this.enqueue(tx, saga.id, orderId, correlationId, result.command!, payload);
      return saga.id;
    });
  }

  async consume(message: MessageEnvelope): Promise<"processed" | "duplicate"> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.inboxMensagem.create({ data: { messageId: message.messageId, tipo: message.messageType, correlationId: message.correlationId, sagaId: message.sagaId, payloadHash: "verified-by-consumer" } });
        if (!message.sagaId) throw new Error("Evento da Saga sem sagaId");
        const saga = await tx.sagaInstancia.findUniqueOrThrow({ where: { id: message.sagaId } });
        const result = transitionSaga(saga.etapaAtual as SagaStep, message.messageType as SagaEvent);
        const updated = await tx.sagaInstancia.updateMany({ where: { id: saga.id, versao: saga.versao }, data: { etapaAtual: result.step, status: statusByStep(result.step), versao: { increment: 1 }, finalizadoEm: result.terminal ? new Date() : null } });
        if (updated.count !== 1) throw new Error("Concorrencia detectada ao atualizar Saga");
        if (result.command) await this.enqueue(tx, saga.id, saga.ordemServicoId, saga.correlationId, result.command, message.payload as Prisma.InputJsonValue, message.messageId);
        return "processed" as const;
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return "duplicate";
      throw error;
    }
  }

  private async enqueue(tx: Prisma.TransactionClient, sagaId: string, orderId: string, correlationId: string, command: SagaCommand, payload: Prisma.InputJsonValue, causationId?: string): Promise<void> {
    await tx.outboxMensagem.create({ data: { aggregateId: orderId, tipo: command, correlationId, sagaId, payload: { target: commandTarget(command), causationId, data: payload } } });
  }
}
