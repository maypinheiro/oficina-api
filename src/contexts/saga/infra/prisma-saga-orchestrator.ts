import { Prisma, PrismaClient, StatusSaga } from "@prisma/client";
import { MessageEnvelope } from "../../../shared/messaging/message-envelope";
import { SagaCommand, SagaEvent, SagaStep, transitionSaga } from "../application/saga-machine";
import { log } from "../../../shared/observability/logger";
import { metrics, trace } from "../../../shared/observability/telemetry";

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
    return trace("saga.start", { "correlation.id": correlationId, "order.id": orderId }, async () => {
      const started = performance.now();
      try {
        const sagaId = await this.prisma.$transaction(async (tx) => {
          const saga = await tx.sagaInstancia.create({ data: { ordemServicoId: orderId, correlationId, etapaAtual: result.step, status: statusByStep(result.step) } });
          await this.enqueue(tx, saga.id, orderId, correlationId, result.command!, payload); return saga.id;
        });
        metrics.increment("saga.started"); metrics.histogram("saga.start.duration_ms", performance.now() - started);
        log("info", "saga_started", { correlationId, sagaId, ordemServicoId: orderId, sagaStep: result.step }); return sagaId;
      } catch (error) {
        metrics.increment("saga.failed", 1, ["phase:start"]); log("error", "saga_start_failed", { correlationId, ordemServicoId: orderId, errorType: error instanceof Error ? error.name : "UnknownError" }); throw error;
      }
    });
  }

  async consume(message: MessageEnvelope): Promise<"processed" | "duplicate"> {
    const started = performance.now(); let nextStep: SagaStep | undefined;
    return trace("saga.event.consume", { "correlation.id": message.correlationId, "saga.id": message.sagaId, "messaging.message.type": message.messageType }, async () => { try {
      const outcome = await this.prisma.$transaction(async (tx) => {
        await tx.inboxMensagem.create({ data: { messageId: message.messageId, tipo: message.messageType, correlationId: message.correlationId, sagaId: message.sagaId, payloadHash: "verified-by-consumer" } });
        if (!message.sagaId) throw new Error("Evento da Saga sem sagaId");
        const saga = await tx.sagaInstancia.findUniqueOrThrow({ where: { id: message.sagaId } });
        const result = transitionSaga(saga.etapaAtual as SagaStep, message.messageType as SagaEvent);
        nextStep = result.step;
        const updated = await tx.sagaInstancia.updateMany({ where: { id: saga.id, versao: saga.versao }, data: { etapaAtual: result.step, status: statusByStep(result.step), versao: { increment: 1 }, finalizadoEm: result.terminal ? new Date() : null } });
        if (updated.count !== 1) throw new Error("Concorrencia detectada ao atualizar Saga");
        if (result.command) await this.enqueue(tx, saga.id, saga.ordemServicoId, saga.correlationId, result.command, message.payload as Prisma.InputJsonValue, message.messageId);
        return "processed" as const;
      });
      const terminal = nextStep === "COMPLETED" || nextStep === "COMPENSATED" || nextStep === "FAILED";
      metrics.increment("saga.transitions", 1, [`event:${message.messageType}`, `step:${nextStep ?? "unknown"}`]); metrics.histogram("saga.transition.duration_ms", performance.now() - started, [`event:${message.messageType}`]);
      if (terminal) metrics.increment(`saga.${String(nextStep).toLowerCase()}`);
      log("info", "saga_event_processed", { correlationId: message.correlationId, sagaId: message.sagaId, eventId: message.messageId, ordemServicoId: message.aggregateId, messageType: message.messageType, sagaStep: nextStep, terminal }); return outcome;
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") { metrics.increment("saga.messages.duplicate"); log("warn", "saga_duplicate_event", { correlationId: message.correlationId, sagaId: message.sagaId, eventId: message.messageId, messageType: message.messageType }); return "duplicate"; }
      metrics.increment("saga.failed", 1, [`event:${message.messageType}`]); log("error", "saga_event_failed", { correlationId: message.correlationId, sagaId: message.sagaId, eventId: message.messageId, ordemServicoId: message.aggregateId, messageType: message.messageType, errorType: error instanceof Error ? error.name : "UnknownError" }); throw error;
    }});
  }

  private async enqueue(tx: Prisma.TransactionClient, sagaId: string, orderId: string, correlationId: string, command: SagaCommand, payload: Prisma.InputJsonValue, causationId?: string): Promise<void> {
    await tx.outboxMensagem.create({ data: { aggregateId: orderId, tipo: command, correlationId, sagaId, payload: { target: commandTarget(command), causationId, data: payload } } });
  }
}
