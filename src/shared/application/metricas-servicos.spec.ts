import { calcularMetricasExecucaoServicos } from "./metricas-servicos";

describe("Metricas de execucao por servico", () => {
  it("calcula tempo medio por servico", () => {
    const inicio = new Date("2026-01-01T10:00:00.000Z");
    const fim = new Date("2026-01-01T12:00:00.000Z");

    const metricas = calcularMetricasExecucaoServicos([
      {
        nome: "Troca",
        orcamentos: [
          {
            orcamento: {
              ordemServico: {
                historico: [
                  { status: "EM_EXECUCAO", dataHora: inicio },
                  { status: "FINALIZADA", dataHora: fim }
                ]
              }
            }
          }
        ]
      }
    ]);

    expect(metricas.get("Troca")).toMatchObject({
      execucoesConsideradas: 1,
      tempoMedioExecucaoHoras: 2
    });
  });

  it("retorna nulo quando nao ha execucoes finalizadas", () => {
    const metricas = calcularMetricasExecucaoServicos([{ nome: "Troca", orcamentos: [] }]);

    expect(metricas.get("Troca")).toMatchObject({
      execucoesConsideradas: 0,
      tempoMedioExecucaoMs: null,
      tempoMedioExecucaoHoras: null
    });
  });
});
