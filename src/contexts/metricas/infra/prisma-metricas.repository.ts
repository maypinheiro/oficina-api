import { PrismaClient } from "@prisma/client";

import { calcularMetricasExecucaoServicos } from "../../../shared/application/metricas-servicos";
import { calcularMedia, converterMsParaHoras } from "../../../shared/application/tempo-medio";
import { servicosComHistoricoInclude } from "../../catalogo/infra/prisma-catalogo.mapper";
import { MetricasRepository, TempoMedioOrdens, TempoMedioServico } from "../application/metricas.repository";

export class PrismaMetricasRepository implements MetricasRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async calcularTempoMedioOrdens(): Promise<TempoMedioOrdens> {
    const ordens = await this.prisma.ordemDeServico.findMany({
      where: { dataFinalizacao: { not: null } },
      select: {
        dataCriacao: true,
        dataFinalizacao: true
      }
    });

    const temposMs = ordens
      .filter((ordem) => ordem.dataFinalizacao)
      .map((ordem) => ordem.dataFinalizacao!.getTime() - ordem.dataCriacao.getTime());
    const tempoMedioMs = calcularMedia(temposMs) ?? 0;

    return {
      ordensFinalizadas: temposMs.length,
      tempoMedioMs,
      tempoMedioHoras: converterMsParaHoras(tempoMedioMs)
    };
  }

  async calcularTempoMedioServicos(): Promise<TempoMedioServico[]> {
    const servicos = await this.prisma.servico.findMany({
      include: servicosComHistoricoInclude,
      orderBy: { nome: "asc" }
    });

    const metricas = calcularMetricasExecucaoServicos(servicos);

    return [...metricas.values()].map((metrica) => {
      return {
        servico: metrica.nome,
        execucoesConsideradas: metrica.execucoesConsideradas,
        tempoMedioExecucaoMs: metrica.tempoMedioExecucaoMs,
        tempoMedioExecucaoHoras: metrica.tempoMedioExecucaoHoras,
        mensagem: metrica.mensagemTempoMedio
      };
    });
  }
}
