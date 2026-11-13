import { PrismaClient } from "@prisma/client";
import { ApplicationError } from "../../../shared/application/application-error";
import { createMessageEnvelope } from "../../../shared/messaging/message-envelope";
import { SagaFailureSimulator } from "../application/saga-failure-simulator";
import { PrismaSagaOrchestrator } from "./prisma-saga-orchestrator";

export class HmlSagaFailureSimulator implements SagaFailureSimulator {
  constructor(private readonly prisma: PrismaClient, private readonly orchestrator: PrismaSagaOrchestrator) {}

  async simulateExecutionFailure(numeroOs: string) {
    const ordem = await this.prisma.ordemDeServico.findUnique({
      where: { numeroOs },
      select: { id: true, numeroOs: true, saga: { select: { id: true, etapaAtual: true, correlationId: true } } },
    });
    if (!ordem?.saga) throw new ApplicationError(404, "OS ou Saga nao encontrada");
    if (ordem.saga.etapaAtual !== "IN_EXECUTION") {
      throw new ApplicationError(422, `Falha de execucao so pode ser simulada em IN_EXECUTION; etapa atual: ${ordem.saga.etapaAtual}`);
    }
    const result = await this.orchestrator.consume(createMessageEnvelope({
      messageType: "ExecutionFailed",
      messageKind: "event",
      source: "hml-failure-simulator",
      aggregateId: ordem.id,
      correlationId: ordem.saga.correlationId,
      sagaId: ordem.saga.id,
      payload: { reason: "controlled-hml-demonstration" },
    }));
    return { numeroOs: ordem.numeroOs, event: "ExecutionFailed" as const, result };
  }
}
