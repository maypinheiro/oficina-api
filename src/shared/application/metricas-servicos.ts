import { calcularMedia, calcularTempoEntreStatus, converterMsParaHoras, HistoricoComStatus } from "./tempo-medio";

export type ServicoComHistoricoExecucao = {
  nome: string;
  orcamentos: Array<{
    orcamento: {
      ordemServico: {
        historico: HistoricoComStatus[];
      };
    };
  }>;
};

export type MetricaExecucaoServico = {
  nome: string;
  execucoesConsideradas: number;
  tempoMedioExecucaoMs: number | null;
  tempoMedioExecucaoHoras: number | null;
  mensagemTempoMedio: string;
};

const mensagemSemExecucoes = "Servico ainda nao possui execucoes finalizadas para calculo do tempo medio.";
const mensagemComExecucoes = "Tempo medio calculado com base no intervalo entre EM_EXECUCAO e FINALIZADA.";

export function calcularMetricasExecucaoServicos<T extends ServicoComHistoricoExecucao>(
  servicos: T[]
): Map<string, MetricaExecucaoServico> {
  const temposPorServico = new Map<string, number[]>();

  for (const servico of servicos) {
    const temposMs = servico.orcamentos
      .map((item) => calcularTempoEntreStatus(item.orcamento.ordemServico.historico, "EM_EXECUCAO", "FINALIZADA"))
      .filter((tempo): tempo is number => tempo !== null);

    temposPorServico.set(servico.nome, [...(temposPorServico.get(servico.nome) ?? []), ...temposMs]);
  }

  return new Map(
    [...temposPorServico.entries()].map(([nome, temposMs]) => {
      const tempoMedioMs = calcularMedia(temposMs);

      return [
        nome,
        {
          nome,
          execucoesConsideradas: temposMs.length,
          tempoMedioExecucaoMs: tempoMedioMs,
          tempoMedioExecucaoHoras: tempoMedioMs === null ? null : converterMsParaHoras(tempoMedioMs),
          mensagemTempoMedio: tempoMedioMs === null ? mensagemSemExecucoes : mensagemComExecucoes
        }
      ];
    })
  );
}
