import { ordenarFilaOperacional, statusOcultosDaFilaOperacional } from "./fila-ordens-servico";

describe("Fila operacional de ordens de servico", () => {
  it("ordena por prioridade de status e depois por criacao mais antiga", () => {
    const recebidaAntiga = { status: "RECEBIDA", dataCriacao: new Date("2026-01-01T10:00:00Z") };
    const execucaoNova = { status: "EM_EXECUCAO", dataCriacao: new Date("2026-01-03T10:00:00Z") };
    const aguardandoAntiga = { status: "AGUARDANDO_APROVACAO", dataCriacao: new Date("2026-01-01T09:00:00Z") };
    const execucaoAntiga = { status: "EM_EXECUCAO", dataCriacao: new Date("2026-01-01T08:00:00Z") };

    expect(ordenarFilaOperacional([recebidaAntiga, execucaoNova, aguardandoAntiga, execucaoAntiga])).toEqual([
      execucaoAntiga,
      execucaoNova,
      aguardandoAntiga,
      recebidaAntiga
    ]);
  });

  it("explicita statuses que nao entram na fila por padrao", () => {
    expect(statusOcultosDaFilaOperacional).toEqual(["FINALIZADA", "ENTREGUE"]);
  });
});
