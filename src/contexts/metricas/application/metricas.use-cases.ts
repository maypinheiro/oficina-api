import {
  CalcularTempoMedioOrdensPort,
  CalcularTempoMedioServicosPort,
  TempoMedioOrdens,
  TempoMedioServico
} from "./metricas.repository";

export class CalcularTempoMedioOrdensUseCase {
  constructor(private readonly metricas: CalcularTempoMedioOrdensPort) {}

  execute(): Promise<TempoMedioOrdens> {
    return this.metricas.calcularTempoMedioOrdens();
  }
}

export class CalcularTempoMedioServicosUseCase {
  constructor(private readonly metricas: CalcularTempoMedioServicosPort) {}

  execute(): Promise<TempoMedioServico[]> {
    return this.metricas.calcularTempoMedioServicos();
  }
}
