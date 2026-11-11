import { PrismaClient } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import { PrismaBillingOrderIdResolver } from "./prisma-billing-order-id.resolver";

describe("PrismaBillingOrderIdResolver", () => {
  const findUnique = jest.fn();
  const prisma = { ordemDeServico: { findUnique } } as unknown as PrismaClient;
  const resolver = new PrismaBillingOrderIdResolver(prisma);

  beforeEach(() => findUnique.mockReset());

  it("traduz o numero publico da OS para o UUID interno", async () => {
    findUnique.mockResolvedValue({ id: "order-uuid" });

    await expect(resolver.resolve("OS-1")).resolves.toBe("order-uuid");
    expect(findUnique).toHaveBeenCalledWith({
      where: { numeroOs: "OS-1" },
      select: { id: true }
    });
  });

  it("retorna 404 quando a OS nao existe", async () => {
    findUnique.mockResolvedValue(null);

    await expect(resolver.resolve("OS-inexistente")).rejects.toBeInstanceOf(ApplicationError);
  });
});
