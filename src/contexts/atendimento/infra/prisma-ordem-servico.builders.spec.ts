import { Prisma } from "@prisma/client";

import { StatusOrdemServicoApp } from "../application/status-ordem-servico-app";
import {
  montarAtualizacaoStatusOrdem,
  montarCriacaoOrcamentoInicial,
  montarCriacaoOrdemComOrcamentoInicial,
  montarCriacaoOrdemRecebida
} from "./prisma-ordem-servico.builders";

describe("Prisma ordem de servico builders", () => {
  const input = {
    cpfCnpj: "52998224725",
    placa: "ABC1D23",
    descricaoProblemaCliente: "Barulho"
  };

  it("monta criacao de OS recebida", () => {
    expect(montarCriacaoOrdemRecebida(input, "cliente-1", "veiculo-1", "OS-1")).toMatchObject({
      numeroOs: "OS-1",
      clienteId: "cliente-1",
      veiculoId: "veiculo-1",
      status: StatusOrdemServicoApp.Recebida,
      historico: { create: { status: StatusOrdemServicoApp.Recebida } }
    });
  });

  it("monta criacao de OS com orcamento inicial", () => {
    const data = montarCriacaoOrdemComOrcamentoInicial(input, "cliente-1", "veiculo-1", "OS-1");

    expect(data.status).toBe(StatusOrdemServicoApp.AguardandoAprovacao);
    expect(data.historico).toMatchObject({
      create: [
        { status: StatusOrdemServicoApp.Recebida },
        { status: StatusOrdemServicoApp.EmDiagnostico },
        { status: StatusOrdemServicoApp.AguardandoAprovacao }
      ]
    });
  });

  it("monta criacao de orcamento inicial", () => {
    const valor = new Prisma.Decimal(10);
    const data = montarCriacaoOrcamentoInicial("ordem-1", {
      valorTotal: 20,
      servicos: [{ id: "servico-1", preco: valor }],
      pecas: [{ pecaId: "peca-1", quantidade: 1, valorUnitario: valor }]
    });

    expect(data).toMatchObject({
      ordemServicoId: "ordem-1",
      valorTotal: 20,
      servicos: { create: [{ servicoId: "servico-1", valor }] },
      pecas: { create: [{ pecaId: "peca-1", quantidade: 1, valorUnitario: valor }] }
    });
  });

  it("monta atualizacao de status com historico", () => {
    expect(montarAtualizacaoStatusOrdem(StatusOrdemServicoApp.Finalizada)).toMatchObject({
      status: StatusOrdemServicoApp.Finalizada,
      historico: { create: { status: StatusOrdemServicoApp.Finalizada } }
    });
  });
});
