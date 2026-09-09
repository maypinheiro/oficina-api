import { Prisma } from "@prisma/client";

import { StatusOrcamentoApp } from "../../orcamento/application/status-orcamento-app";
import { CriarOrdemServicoInput } from "../application/ordem-servico.repository";
import { StatusOrdemServicoApp } from "../application/status-ordem-servico-app";

export const problemaTecnicoPadraoParaOrcamentoInicial =
  "Servicos e pecas informados na abertura da OS para composicao do orcamento inicial.";

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

export function montarCriacaoOrdemRecebida(
  input: CriarOrdemServicoInput,
  clienteId: string,
  veiculoId: string,
  numeroOs: string
): Prisma.OrdemDeServicoUncheckedCreateInput {
  return {
    numeroOs,
    clienteId,
    veiculoId,
    descricaoProblemaCliente: input.descricaoProblemaCliente,
    status: StatusOrdemServicoApp.Recebida,
    historico: { create: { status: StatusOrdemServicoApp.Recebida } }
  };
}

export function montarCriacaoOrdemComOrcamentoInicial(
  input: CriarOrdemServicoInput,
  clienteId: string,
  veiculoId: string,
  numeroOs: string
): Prisma.OrdemDeServicoUncheckedCreateInput {
  return {
    numeroOs,
    clienteId,
    veiculoId,
    descricaoProblemaCliente: input.descricaoProblemaCliente,
    problemaIdentificado: problemaTecnicoPadraoParaOrcamentoInicial,
    status: StatusOrdemServicoApp.AguardandoAprovacao,
    historico: {
      create: [
        { status: StatusOrdemServicoApp.Recebida },
        { status: StatusOrdemServicoApp.EmDiagnostico },
        { status: StatusOrdemServicoApp.AguardandoAprovacao }
      ]
    }
  };
}

export function montarCriacaoOrcamentoInicial(
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

export function montarAtualizacaoStatusOrdem(
  status: StatusOrdemServicoApp,
  data?: { problemaIdentificado?: string; dataFinalizacao?: Date }
): Prisma.OrdemDeServicoUpdateInput {
  return {
    status,
    ...data,
    historico: { create: { status } }
  };
}
