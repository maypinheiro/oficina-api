import { PrismaClient } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import {
  CriarOrcamentoInput,
  OrcamentoCriado,
  OrcamentoRepository,
  OrdemServicoComDecisaoOrcamento
} from "../application/orcamento.repository";
import {
  validarAprovacaoOrcamento,
  validarCriacaoOrcamento,
  validarRejeicaoOrcamento
} from "../application/fluxo-orcamento";
import { StatusOrcamentoApp } from "../application/status-orcamento-app";
import {
  montarAtualizacaoAprovacaoOrcamento,
  montarAtualizacaoRejeicaoOrcamento,
  montarCriacaoOrcamento,
  orcamentoComItensInclude,
  ordemComDecisaoOrcamentoInclude
} from "./prisma-orcamento.builders";
import { prepararItensOrcamentoComReserva } from "./prisma-itens-orcamento";

export class PrismaOrcamentoRepository implements OrcamentoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public criarComReserva(input: CriarOrcamentoInput): Promise<OrcamentoCriado> {
    return this.prisma.$transaction(async (tx) => {
      const ordem = await tx.ordemDeServico.findUnique({
        where: { numeroOs: input.numeroOs },
        include: { orcamento: true }
      });

      if (!ordem) {
        throw new ApplicationError(404, "Ordem de servico nao encontrada");
      }

      validarCriacaoOrcamento(ordem.status, Boolean(ordem.orcamento));

      const itens = await prepararItensOrcamentoComReserva(tx, input);

      return tx.orcamento.create({
        data: montarCriacaoOrcamento(ordem.id, itens),
        include: orcamentoComItensInclude
      });
    });
  }

  public async aprovar(numeroOs: string): Promise<OrdemServicoComDecisaoOrcamento> {
    const ordem = await this.prisma.ordemDeServico.findUnique({
      where: { numeroOs },
      include: { orcamento: true }
    });
    const orcamento = ordem?.orcamento;

    if (!ordem || !orcamento) {
      throw new ApplicationError(404, "Orcamento nao encontrado");
    }

    validarAprovacaoOrcamento(orcamento.status);

    return this.prisma.$transaction(async (tx) => {
      await tx.orcamento.update({
        where: { id: orcamento.id },
        data: { status: StatusOrcamentoApp.Aprovado }
      });

      return tx.ordemDeServico.update({
        where: { id: ordem.id },
        data: montarAtualizacaoAprovacaoOrcamento(),
        include: ordemComDecisaoOrcamentoInclude
      });
    });
  }

  public rejeitarComDevolucao(numeroOs: string): Promise<OrdemServicoComDecisaoOrcamento> {
    return this.prisma.$transaction(async (tx) => {
      const ordem = await tx.ordemDeServico.findUnique({
        where: { numeroOs },
        include: { orcamento: { include: { pecas: true } } }
      });
      const orcamento = ordem?.orcamento;

      if (!orcamento) {
        throw new ApplicationError(404, "Orcamento nao encontrado");
      }

      validarRejeicaoOrcamento(orcamento.status);

      await tx.orcamento.update({
        where: { id: orcamento.id },
        data: { status: StatusOrcamentoApp.Rejeitado }
      });

      return tx.ordemDeServico.update({
        where: { id: ordem.id },
        data: montarAtualizacaoRejeicaoOrcamento(),
        include: ordemComDecisaoOrcamentoInclude
      });
    });
  }
}
