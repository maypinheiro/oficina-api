import { Prisma } from "@prisma/client";

import { StatusOrdemServicoApp } from "../../atendimento/application/status-ordem-servico-app";
import { StatusOrcamentoApp } from "../application/status-orcamento-app";

type ItensOrcamentoPreparados = {
  valorTotal: number;
  servicos: Array<{
    id: string;
    preco: Prisma.Decimal;
  }>;
  pecas: Array<{
    pecaId: string;
    quantidade: number;
    valorUnitario: Prisma.Decimal;
  }>;
};

export const orcamentoComItensInclude = {
  servicos: true,
  pecas: true
} satisfies Prisma.OrcamentoInclude;

export const ordemComDecisaoOrcamentoInclude = {
  orcamento: { include: orcamentoComItensInclude },
  historico: { orderBy: { dataHora: "asc" } }
} satisfies Prisma.OrdemDeServicoInclude;

export function montarCriacaoOrcamento(
  ordemServicoId: string,
  itens: ItensOrcamentoPreparados
): Prisma.OrcamentoUncheckedCreateInput {
  return {
    ordemServicoId,
    valorTotal: itens.valorTotal,
    status: StatusOrcamentoApp.Pendente,
    servicos: {
      create: itens.servicos.map((servico) => ({
        servicoId: servico.id,
        valor: servico.preco
      }))
    },
    pecas: {
      create: itens.pecas.map((peca) => ({
        pecaId: peca.pecaId,
        quantidade: peca.quantidade,
        valorUnitario: peca.valorUnitario
      }))
    }
  };
}

export function montarAtualizacaoAprovacaoOrcamento(): Prisma.OrdemDeServicoUpdateInput {
  return {
    status: StatusOrdemServicoApp.Aprovada,
    historico: { create: { status: StatusOrdemServicoApp.Aprovada } }
  };
}

export function montarAtualizacaoRejeicaoOrcamento(): Prisma.OrdemDeServicoUpdateInput {
  return {
    status: StatusOrdemServicoApp.OrcamentoRejeitado,
    historico: {
      create: { status: StatusOrdemServicoApp.OrcamentoRejeitado }
    }
  };
}
