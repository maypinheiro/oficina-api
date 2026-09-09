export type HistoricoComStatus = {
  status: string;
  dataHora: Date;
};

export function calcularMedia(valores: number[]): number | null {
  if (valores.length === 0) {
    return null;
  }

  return valores.reduce((total, valor) => total + valor, 0) / valores.length;
}

export function calcularTempoEntreStatus(
  historico: HistoricoComStatus[],
  statusInicial: string,
  statusFinal: string
): number | null {
  const inicio = historico.find((item) => item.status === statusInicial);
  const fim = historico.find((item) => item.status === statusFinal);

  if (!inicio || !fim || fim.dataHora <= inicio.dataHora) {
    return null;
  }

  return fim.dataHora.getTime() - inicio.dataHora.getTime();
}

export function converterMsParaHoras(tempoMs: number): number {
  return tempoMs / 1000 / 60 / 60;
}
