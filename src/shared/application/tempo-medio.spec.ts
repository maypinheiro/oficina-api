import { calcularMedia, calcularTempoEntreStatus, converterMsParaHoras } from "./tempo-medio";

describe("Tempo medio", () => {
  it("calcula media quando ha valores", () => {
    expect(calcularMedia([10, 20, 30])).toBe(20);
  });

  it("retorna nulo quando nao ha valores", () => {
    expect(calcularMedia([])).toBeNull();
  });

  it("calcula intervalo entre dois status", () => {
    const inicio = new Date("2026-01-01T10:00:00.000Z");
    const fim = new Date("2026-01-01T12:00:00.000Z");

    expect(
      calcularTempoEntreStatus(
        [
          { status: "EM_EXECUCAO", dataHora: inicio },
          { status: "FINALIZADA", dataHora: fim }
        ],
        "EM_EXECUCAO",
        "FINALIZADA"
      )
    ).toBe(2 * 60 * 60 * 1000);
  });

  it("retorna nulo para historico incompleto ou invertido", () => {
    expect(calcularTempoEntreStatus([{ status: "FINALIZADA", dataHora: new Date() }], "EM_EXECUCAO", "FINALIZADA")).toBeNull();
  });

  it("converte milissegundos para horas", () => {
    expect(converterMsParaHoras(2 * 60 * 60 * 1000)).toBe(2);
  });
});
