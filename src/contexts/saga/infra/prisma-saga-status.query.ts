import { PrismaClient } from "@prisma/client";
import { ApplicationError } from "../../../shared/application/application-error";
import { SagaStatusQuery, SagaStatusView } from "../application/saga-status.query";

export class PrismaSagaStatusQuery implements SagaStatusQuery {
  constructor(private readonly prisma: PrismaClient) {}

  async findByOrderNumber(numeroOs: string): Promise<SagaStatusView> {
    const ordem = await this.prisma.ordemDeServico.findUnique({
      where: { numeroOs },
      select: {
        numeroOs: true,
        saga: {
          select: {
            id: true,
            status: true,
            etapaAtual: true,
            correlationId: true,
            iniciadoEm: true,
            atualizadoEm: true,
            finalizadoEm: true,
            ultimoErro: true,
          },
        },
      },
    });
    if (!ordem) throw new ApplicationError(404, "Ordem de servico nao encontrada");
    if (!ordem.saga) throw new ApplicationError(404, "Saga nao encontrada para a ordem de servico");
    return {
      sagaId: ordem.saga.id,
      numeroOs: ordem.numeroOs,
      status: ordem.saga.status,
      etapaAtual: ordem.saga.etapaAtual,
      correlationId: ordem.saga.correlationId,
      iniciadoEm: ordem.saga.iniciadoEm,
      atualizadoEm: ordem.saga.atualizadoEm,
      finalizadoEm: ordem.saga.finalizadoEm,
      ultimoErro: ordem.saga.ultimoErro,
    };
  }
}
