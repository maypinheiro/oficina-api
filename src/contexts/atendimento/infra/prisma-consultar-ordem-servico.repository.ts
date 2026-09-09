import { PrismaClient } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import { ordenarFilaOperacional, statusOcultosDaFilaOperacional } from "../application/fila-ordens-servico";
import { calcularTotalPaginas, normalizarPaginacao, paginarItens } from "../application/paginacao";
import {
  BuscarOrdemServicoPort,
  ConsultarStatusOrdemServicoPort,
  HistoricoStatusOrdemServico,
  ListarHistoricoOrdemServicoPort,
  ListarOrdensServicoFiltros,
  ListarOrdensServicoPort,
  OrdemServicoDetalhada,
  StatusOrdemServicoConsulta
} from "../application/ordem-servico.repository";
import { StatusOrdemServicoApp } from "../application/status-ordem-servico-app";
import { buscarOrdemServicoObrigatoriaPorNumero } from "./prisma-ordem-servico-consultas";
import {
  mapOrdemServicoDetalhada,
  mapStatusOrdemServico,
  ordemServicoDetalhadaInclude,
  statusOrdemServicoSelect
} from "./prisma-ordem-servico.mapper";

export class PrismaConsultarOrdemServicoRepository
  implements ListarOrdensServicoPort, BuscarOrdemServicoPort, ConsultarStatusOrdemServicoPort, ListarHistoricoOrdemServicoPort
{
  constructor(private readonly prisma: PrismaClient) {}

  async listar(filtros: ListarOrdensServicoFiltros = {}) {
    const paginacao = normalizarPaginacao(filtros.page, filtros.pageSize);
    const status = filtros.status as StatusOrdemServicoApp | undefined;
    const where = status ? { status } : { status: { notIn: [...statusOcultosDaFilaOperacional] } };
    const [ordens, total] = await this.prisma.$transaction([
      this.prisma.ordemDeServico.findMany({
        where,
        include: { cliente: true, veiculo: true, orcamento: true },
        orderBy: { dataCriacao: "asc" }
      }),
      this.prisma.ordemDeServico.count({ where })
    ]);
    const items = paginarItens(ordenarFilaOperacional(ordens), paginacao);

    return {
      items,
      pagination: {
        page: paginacao.page,
        pageSize: paginacao.pageSize,
        total,
        totalPages: calcularTotalPaginas(total, paginacao.pageSize)
      }
    };
  }

  async buscarPorNumero(numeroOs: string): Promise<OrdemServicoDetalhada> {
    const ordem = await this.prisma.ordemDeServico.findUnique({
      where: { numeroOs },
      include: ordemServicoDetalhadaInclude
    });

    if (!ordem) {
      throw new ApplicationError(404, "Ordem de servico nao encontrada");
    }

    return mapOrdemServicoDetalhada(ordem);
  }

  async consultarStatus(numeroOs: string): Promise<StatusOrdemServicoConsulta> {
    const ordem = await this.prisma.ordemDeServico.findUnique({
      where: { numeroOs },
      select: statusOrdemServicoSelect
    });

    if (!ordem) {
      throw new ApplicationError(404, "Ordem de servico nao encontrada");
    }

    return mapStatusOrdemServico(ordem);
  }

  async listarHistorico(numeroOs: string): Promise<HistoricoStatusOrdemServico[]> {
    const ordem = await buscarOrdemServicoObrigatoriaPorNumero(this.prisma, numeroOs);

    return this.prisma.historicoStatusOS.findMany({
      where: { ordemServicoId: ordem.id },
      orderBy: { dataHora: "asc" }
    });
  }
}
