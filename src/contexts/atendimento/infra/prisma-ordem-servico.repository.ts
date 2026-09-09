import { PrismaClient } from "@prisma/client";

import {
  CriarOrdemServicoInput,
  HistoricoStatusOrdemServico,
  ListarOrdensServicoFiltros,
  OrdemServicoComOrcamentoInicial,
  OrdemServicoCriada,
  OrdemServicoDetalhada,
  OrdemServicoRepository,
  OrdemServicoStatusAtualizada,
  StatusOrdemServicoConsulta
} from "../application/ordem-servico.repository";
import { StatusOrdemServicoApp } from "../application/status-ordem-servico-app";
import { PrismaAtualizarStatusOrdemServicoRepository } from "./prisma-atualizar-status-ordem-servico.repository";
import { buscarOrdemServicoObrigatoriaPorNumero } from "./prisma-ordem-servico-consultas";
import { PrismaConsultarOrdemServicoRepository } from "./prisma-consultar-ordem-servico.repository";
import { PrismaCriarOrdemServicoRepository } from "./prisma-criar-ordem-servico.repository";
import { montarAtualizacaoStatusOrdem } from "./prisma-ordem-servico.builders";
import { historicoOrdenadoInclude } from "./prisma-ordem-servico.mapper";

export class PrismaOrdemServicoRepository implements OrdemServicoRepository {
  private readonly criacao: PrismaCriarOrdemServicoRepository;
  private readonly consulta: PrismaConsultarOrdemServicoRepository;
  private readonly status: PrismaAtualizarStatusOrdemServicoRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.criacao = new PrismaCriarOrdemServicoRepository(prisma);
    this.consulta = new PrismaConsultarOrdemServicoRepository(prisma);
    this.status = new PrismaAtualizarStatusOrdemServicoRepository(prisma);
  }

  criar(input: CriarOrdemServicoInput): Promise<OrdemServicoCriada> {
    return this.criacao.criar(input);
  }

  criarComOrcamentoInicial(input: CriarOrdemServicoInput): Promise<OrdemServicoComOrcamentoInicial> {
    return this.criacao.criarComOrcamentoInicial(input);
  }

  listar(filtros?: ListarOrdensServicoFiltros) {
    return this.consulta.listar(filtros);
  }

  buscarPorNumero(numeroOs: string): Promise<OrdemServicoDetalhada> {
    return this.consulta.buscarPorNumero(numeroOs);
  }

  consultarStatus(numeroOs: string): Promise<StatusOrdemServicoConsulta> {
    return this.consulta.consultarStatus(numeroOs);
  }

  listarHistorico(numeroOs: string): Promise<HistoricoStatusOrdemServico[]> {
    return this.consulta.listarHistorico(numeroOs);
  }

  iniciarDiagnostico(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    return this.status.iniciarDiagnostico(numeroOs);
  }

  registrarProblema(numeroOs: string, problemaIdentificado: string): Promise<OrdemServicoStatusAtualizada> {
    return this.status.registrarProblema(numeroOs, problemaIdentificado);
  }

  iniciarExecucao(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    return this.status.iniciarExecucao(numeroOs);
  }

  finalizar(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    return this.status.finalizar(numeroOs);
  }

  entregar(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    return this.status.entregar(numeroOs);
  }

  async marcarOrcamentoRejeitado(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    const ordem = await buscarOrdemServicoObrigatoriaPorNumero(this.prisma, numeroOs);

    return this.prisma.ordemDeServico.update({
      where: { id: ordem.id },
      data: montarAtualizacaoStatusOrdem(StatusOrdemServicoApp.OrcamentoRejeitado),
      include: historicoOrdenadoInclude
    });
  }
}
