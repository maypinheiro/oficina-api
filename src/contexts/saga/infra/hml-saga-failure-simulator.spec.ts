import { PrismaClient } from "@prisma/client";
import { PrismaSagaOrchestrator } from "./prisma-saga-orchestrator";
import { HmlSagaFailureSimulator } from "./hml-saga-failure-simulator";

describe("HmlSagaFailureSimulator", () => {
  it("injects ExecutionFailed with the original Saga context", async () => {
    const prisma = { ordemDeServico: { findUnique: jest.fn().mockResolvedValue({
      id: "order-1", numeroOs: "OS-1", saga: { id: "saga-1", etapaAtual: "IN_EXECUTION", correlationId: "corr-1" },
    }) } } as unknown as PrismaClient;
    const consume = jest.fn().mockResolvedValue("processed");
    const result = await new HmlSagaFailureSimulator(prisma, { consume } as unknown as PrismaSagaOrchestrator).simulateExecutionFailure("OS-1");
    expect(result).toEqual({ numeroOs: "OS-1", event: "ExecutionFailed", result: "processed" });
    expect(consume).toHaveBeenCalledWith(expect.objectContaining({ messageType: "ExecutionFailed", sagaId: "saga-1", correlationId: "corr-1", aggregateId: "order-1" }));
  });

  it("rejects an order outside IN_EXECUTION", async () => {
    const prisma = { ordemDeServico: { findUnique: jest.fn().mockResolvedValue({ id: "order-1", numeroOs: "OS-1", saga: { id: "saga-1", etapaAtual: "WAITING_PAYMENT", correlationId: "corr-1" } }) } } as unknown as PrismaClient;
    await expect(new HmlSagaFailureSimulator(prisma, {} as PrismaSagaOrchestrator).simulateExecutionFailure("OS-1")).rejects.toMatchObject({ statusCode: 422 });
  });

  it("rejects an unknown Saga", async () => {
    const prisma = { ordemDeServico: { findUnique: jest.fn().mockResolvedValue(null) } } as unknown as PrismaClient;
    await expect(new HmlSagaFailureSimulator(prisma, {} as PrismaSagaOrchestrator).simulateExecutionFailure("missing")).rejects.toMatchObject({ statusCode: 404 });
  });
});
