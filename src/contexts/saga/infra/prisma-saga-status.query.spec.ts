import { PrismaClient } from "@prisma/client";
import { PrismaSagaStatusQuery } from "./prisma-saga-status.query";

describe("PrismaSagaStatusQuery", () => {
  it("returns the Saga evidence by public order number", async () => {
    const now = new Date();
    const prisma = { ordemDeServico: { findUnique: jest.fn().mockResolvedValue({
      numeroOs: "OS-1",
      saga: { id: "saga-1", status: "CONCLUIDA", etapaAtual: "COMPLETED", correlationId: "corr-1", iniciadoEm: now, atualizadoEm: now, finalizadoEm: now, ultimoErro: null },
    }) } } as unknown as PrismaClient;
    await expect(new PrismaSagaStatusQuery(prisma).findByOrderNumber("OS-1")).resolves.toMatchObject({ sagaId: "saga-1", status: "CONCLUIDA", etapaAtual: "COMPLETED" });
  });

  it("returns 404 when the order does not exist", async () => {
    const prisma = { ordemDeServico: { findUnique: jest.fn().mockResolvedValue(null) } } as unknown as PrismaClient;
    await expect(new PrismaSagaStatusQuery(prisma).findByOrderNumber("missing")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("returns 404 for a legacy order without Saga", async () => {
    const prisma = { ordemDeServico: { findUnique: jest.fn().mockResolvedValue({ numeroOs: "OS-LEGACY", saga: null }) } } as unknown as PrismaClient;
    await expect(new PrismaSagaStatusQuery(prisma).findByOrderNumber("OS-LEGACY")).rejects.toMatchObject({ statusCode: 404 });
  });
});
