import { PrismaClient } from "@prisma/client";

import { calcularMetricasExecucaoServicos } from "../../../shared/application/metricas-servicos";
import { calcularMedia, calcularTempoEntreStatus, converterMsParaHoras } from "../../../shared/application/tempo-medio";
import { servicosComHistoricoInclude } from "../../catalogo/infra/prisma-catalogo.mapper";
import { MetricasRepository, TempoMedioOrdens, TempoMedioServico } from "../application/metricas.repository";

export class PrismaMetricasRepository implements MetricasRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async calcularTempoMedioOrdens(): Promise<TempoMedioOrdens> {
    const inicioDoDia = new Date();
    inicioDoDia.setUTCHours(0, 0, 0, 0);
    const volumeDiario = await this.prisma.ordemDeServico.count({
      where: { dataCriacao: { gte: inicioDoDia } }
    });
    const ordens = await this.prisma.ordemDeServico.findMany({
      where: { dataFinalizacao: { not: null } },
      select: {
        dataCriacao: true,
        dataFinalizacao: true,
        historico: { select: { status: true, dataHora: true }, orderBy: { dataHora: "asc" } }
      }
    });

    const temposMs = ordens
      .filter((ordem) => ordem.dataFinalizacao)
      .map((ordem) => ordem.dataFinalizacao!.getTime() - ordem.dataCriacao.getTime());
    const tempoMedioMs = calcularMedia(temposMs) ?? 0;
    const diagnosticoMs = calcularMedia(ordens
      .map((ordem) => calcularTempoEntreStatus(ordem.historico, "EM_DIAGNOSTICO", "AGUARDANDO_APROVACAO"))
      .filter((tempo): tempo is number => tempo !== null)) ?? 0;
    const execucaoMs = calcularMedia(ordens
      .map((ordem) => calcularTempoEntreStatus(ordem.historico, "EM_EXECUCAO", "FINALIZADA"))
      .filter((tempo): tempo is number => tempo !== null)) ?? 0;

    return {
      ordensFinalizadas: temposMs.length,
      volumeDiario,
      tempoMedioMs,
      tempoMedioHoras: converterMsParaHoras(tempoMedioMs),
      tempoMedioDiagnosticoHoras: converterMsParaHoras(diagnosticoMs),
      tempoMedioExecucaoHoras: converterMsParaHoras(execucaoMs)
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
