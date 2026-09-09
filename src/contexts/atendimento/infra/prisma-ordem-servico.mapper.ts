import { Prisma } from "@prisma/client";

import {
  OrdemServicoDetalhada,
  StatusOrdemServicoConsulta
} from "../application/ordem-servico.repository";

export const ordemServicoDetalhadaInclude = {
  cliente: true,
  veiculo: true,
  orcamento: {
    include: {
      servicos: { include: { servico: true } },
      pecas: { include: { peca: true } }
    }
  },
  historico: { orderBy: { dataHora: "asc" } }
} satisfies Prisma.OrdemDeServicoInclude;

export const statusOrdemServicoSelect = {
  numeroOs: true,
  status: true,
  dataCriacao: true,
  historico: {
    orderBy: { dataHora: "desc" },
    take: 1,
    select: { dataHora: true }
  }
} satisfies Prisma.OrdemDeServicoSelect;

export const historicoOrdenadoInclude = {
  historico: { orderBy: { dataHora: "asc" } }
} satisfies Prisma.OrdemDeServicoInclude;

type OrdemServicoDetalhadaPrisma = Prisma.OrdemDeServicoGetPayload<{
  include: typeof ordemServicoDetalhadaInclude;
}>;

type StatusOrdemServicoPrisma = Prisma.OrdemDeServicoGetPayload<{
  select: typeof statusOrdemServicoSelect;
}>;

export function mapOrdemServicoDetalhada(ordem: OrdemServicoDetalhadaPrisma): OrdemServicoDetalhada {
  return {
    numeroOs: ordem.numeroOs,
    status: ordem.status,
    descricaoProblemaCliente: ordem.descricaoProblemaCliente,
    problemaIdentificado: ordem.problemaIdentificado,
    dataCriacao: ordem.dataCriacao,
    dataFinalizacao: ordem.dataFinalizacao,
    cliente: {
      nome: ordem.cliente.nome,
      cpfCnpj: ordem.cliente.cpfCnpj,
      email: ordem.cliente.email,
      telefone: ordem.cliente.telefone
    },
    veiculo: {
      placa: ordem.veiculo.placa,
      marca: ordem.veiculo.marca,
      modelo: ordem.veiculo.modelo,
      ano: ordem.veiculo.ano
    },
    orcamento: ordem.orcamento
      ? {
          status: ordem.orcamento.status,
          valorTotal: Number(ordem.orcamento.valorTotal),
          servicos: ordem.orcamento.servicos.map((item) => ({
            nome: item.servico.nome,
            valor: Number(item.valor)
          })),
          pecas: ordem.orcamento.pecas.map((item) => ({
            nome: item.peca.nome,
            quantidade: item.quantidade,
            valorUnitario: Number(item.valorUnitario),
            valorTotal: Number(item.valorUnitario) * item.quantidade
          }))
        }
      : null,
    historico: ordem.historico.map((item) => ({
      status: item.status,
      dataHora: item.dataHora
    }))
  };
}

export function mapStatusOrdemServico(ordem: StatusOrdemServicoPrisma): StatusOrdemServicoConsulta {
  return {
    numeroOs: ordem.numeroOs,
    statusAtual: ordem.status,
    dataCriacao: ordem.dataCriacao,
    ultimaAtualizacaoStatus: ordem.historico[0]?.dataHora ?? ordem.dataCriacao
  };
}
