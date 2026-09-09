import { Prisma } from "@prisma/client";

import { StatusOrdemServicoApp } from "../../atendimento/application/status-ordem-servico-app";
import { StatusOrcamentoApp } from "../application/status-orcamento-app";
import {
  montarAtualizacaoAprovacaoOrcamento,
  montarAtualizacaoRejeicaoOrcamento,
  montarCriacaoOrcamento
} from "./prisma-orcamento.builders";

describe("Prisma orcamento builders", () => {
  it("monta criacao de orcamento", () => {
    const valor = new Prisma.Decimal(50);

    expect(
      montarCriacaoOrcamento("ordem-1", {
        valorTotal: 100,
        servicos: [{ id: "servico-1", preco: valor }],
        pecas: [{ pecaId: "peca-1", quantidade: 1, valorUnitario: valor }]
      })
    ).toMatchObject({
      ordemServicoId: "ordem-1",
      valorTotal: 100,
      status: StatusOrcamentoApp.Pendente,
      servicos: { create: [{ servicoId: "servico-1", valor }] },
      pecas: { create: [{ pecaId: "peca-1", quantidade: 1, valorUnitario: valor }] }
    });
  });

  it("monta atualizacao de aprovacao", () => {
    expect(montarAtualizacaoAprovacaoOrcamento()).toMatchObject({
      status: StatusOrdemServicoApp.Aprovada,
      historico: { create: { status: StatusOrdemServicoApp.Aprovada } }
    });
  });

  it("monta atualizacao de rejeicao", () => {
    expect(montarAtualizacaoRejeicaoOrcamento()).toMatchObject({
      status: StatusOrdemServicoApp.OrcamentoRejeitado,
      historico: { create: { status: StatusOrdemServicoApp.OrcamentoRejeitado } }
    });
  });
});
