import { CalcularTempoMedioOrdensUseCase, CalcularTempoMedioServicosUseCase } from "./metricas.use-cases";
import { MetricasRepository } from "./metricas.repository";

describe("Metricas use cases", () => {
  const metricas: jest.Mocked<MetricasRepository> = {
    calcularTempoMedioOrdens: jest.fn(),
    calcularTempoMedioServicos: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it("delegam calculos para o repositorio de metricas", async () => {
    await new CalcularTempoMedioOrdensUseCase(metricas).execute();
    await new CalcularTempoMedioServicosUseCase(metricas).execute();

    expect(metricas.calcularTempoMedioOrdens).toHaveBeenCalledTimes(1);
    expect(metricas.calcularTempoMedioServicos).toHaveBeenCalledTimes(1);
  });
});
