import { CalcularTempoMedioOrdensUseCase, CalcularTempoMedioServicosUseCase } from "../../../contexts/metricas/application/metricas.use-cases";
import { metrics } from "../../../shared/observability/telemetry";

export class MetricasController {
  constructor(
    private readonly calcularTempoMedioOrdensUseCase: CalcularTempoMedioOrdensUseCase,
    private readonly calcularTempoMedioServicosUseCase: CalcularTempoMedioServicosUseCase
  ) {}

  async calcularTempoMedioOrdens() {
    const resultado = await this.calcularTempoMedioOrdensUseCase.execute();
    metrics.gauge("os.volume_daily", resultado.volumeDiario);
    metrics.gauge("os.duration.diagnostico_hours", resultado.tempoMedioDiagnosticoHoras);
    metrics.gauge("os.duration.execucao_hours", resultado.tempoMedioExecucaoHoras);
    metrics.gauge("os.duration.finalizacao_hours", resultado.tempoMedioHoras);
    return resultado;
  }

  calcularTempoMedioServicos() {
    return this.calcularTempoMedioServicosUseCase.execute();
  }
}
