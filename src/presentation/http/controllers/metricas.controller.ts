import { CalcularTempoMedioOrdensUseCase, CalcularTempoMedioServicosUseCase } from "../../../contexts/metricas/application/metricas.use-cases";

export class MetricasController {
  constructor(
    private readonly calcularTempoMedioOrdensUseCase: CalcularTempoMedioOrdensUseCase,
    private readonly calcularTempoMedioServicosUseCase: CalcularTempoMedioServicosUseCase
  ) {}

  calcularTempoMedioOrdens() {
    return this.calcularTempoMedioOrdensUseCase.execute();
  }

  calcularTempoMedioServicos() {
    return this.calcularTempoMedioServicosUseCase.execute();
  }
}
