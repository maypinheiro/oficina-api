export type TempoMedioOrdens = {
  ordensFinalizadas: number;
  volumeDiario: number;
  tempoMedioMs: number;
  tempoMedioHoras: number;
  tempoMedioDiagnosticoHoras: number;
  tempoMedioExecucaoHoras: number;
};

export type TempoMedioServico = {
  servico: string;
  execucoesConsideradas: number;
  tempoMedioExecucaoMs: number | null;
  tempoMedioExecucaoHoras: number | null;
  mensagem: string;
};

export type CalcularTempoMedioOrdensPort = {
  calcularTempoMedioOrdens(): Promise<TempoMedioOrdens>;
};

export type CalcularTempoMedioServicosPort = {
  calcularTempoMedioServicos(): Promise<TempoMedioServico[]>;
};

export type MetricasRepository = CalcularTempoMedioOrdensPort & CalcularTempoMedioServicosPort;
