import { PrismaClient } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import {
  validarEntrega,
  validarFinalizacao,
  validarInicioDiagnostico,
  validarInicioExecucao,
  validarRegistroProblema
} from "../application/fluxo-ordem-servico";
import { AtualizarStatusOrdemServicoPort, OrdemServicoStatusAtualizada } from "../application/ordem-servico.repository";
import { StatusOrdemServicoApp } from "../application/status-ordem-servico-app";
import { montarAtualizacaoStatusOrdem } from "./prisma-ordem-servico.builders";
import { buscarOrdemServicoObrigatoriaPorNumero, consumirReservasDoOrcamento } from "./prisma-ordem-servico-consultas";
import { historicoOrdenadoInclude } from "./prisma-ordem-servico.mapper";

export class PrismaAtualizarStatusOrdemServicoRepository implements AtualizarStatusOrdemServicoPort {
  constructor(private readonly prisma: PrismaClient) {}

  async iniciarDiagnostico(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    const ordem = await buscarOrdemServicoObrigatoriaPorNumero(this.prisma, numeroOs);

    validarInicioDiagnostico(ordem.status);

    return this.alterarStatus(ordem.id, StatusOrdemServicoApp.EmDiagnostico);
  }

  async registrarProblema(numeroOs: string, problemaIdentificado: string): Promise<OrdemServicoStatusAtualizada> {
    const ordem = await buscarOrdemServicoObrigatoriaPorNumero(this.prisma, numeroOs);

    validarRegistroProblema(ordem.status);

    return this.alterarStatus(ordem.id, StatusOrdemServicoApp.AguardandoAprovacao, { problemaIdentificado });
  }

  async iniciarExecucao(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    const ordem = await this.prisma.ordemDeServico.findUnique({
      where: { numeroOs },
      include: { orcamento: true }
    });

    if (!ordem) {
      throw new ApplicationError(404, "Ordem de servico nao encontrada");
    }

    validarInicioExecucao(ordem.status, ordem.orcamento?.status);

    const orcamentoId = ordem.orcamento?.id;

    if (!orcamentoId) {
      throw new ApplicationError(422, "Execucao somente apos aprovacao do orcamento");
    }

    return this.prisma.$transaction(async (tx) => {
      await consumirReservasDoOrcamento(tx, orcamentoId);

      return tx.ordemDeServico.update({
        where: { id: ordem.id },
        data: {
          status: StatusOrdemServicoApp.EmExecucao,
          historico: { create: { status: StatusOrdemServicoApp.EmExecucao } }
        },
        include: historicoOrdenadoInclude
      });
    });
  }

  async finalizar(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    const ordem = await buscarOrdemServicoObrigatoriaPorNumero(this.prisma, numeroOs);

    validarFinalizacao(ordem.status);

    return this.alterarStatus(ordem.id, StatusOrdemServicoApp.Finalizada, { dataFinalizacao: new Date() });
  }

  async entregar(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    const ordem = await buscarOrdemServicoObrigatoriaPorNumero(this.prisma, numeroOs);

    validarEntrega(ordem.status);

    return this.alterarStatus(ordem.id, StatusOrdemServicoApp.Entregue);
  }

  private alterarStatus(
    id: string,
    status: StatusOrdemServicoApp,
    data?: { problemaIdentificado?: string; dataFinalizacao?: Date }
  ): Promise<OrdemServicoStatusAtualizada> {
    return this.prisma.ordemDeServico.update({
      where: { id },
      data: montarAtualizacaoStatusOrdem(status, data),
      include: historicoOrdenadoInclude
    });
  }
}
