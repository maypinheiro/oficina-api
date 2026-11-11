import { PrismaClient } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import { BillingOrderIdResolver } from "../application/billing-order-id-resolver";

export class PrismaBillingOrderIdResolver implements BillingOrderIdResolver {
  constructor(private readonly prisma: PrismaClient) {}

  async resolve(numeroOs: string): Promise<string> {
    const ordem = await this.prisma.ordemDeServico.findUnique({
      where: { numeroOs },
      select: { id: true }
    });

    if (!ordem) {
      throw new ApplicationError(404, "Ordem de servico nao encontrada");
    }

    return ordem.id;
  }
}
