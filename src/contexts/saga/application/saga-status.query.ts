export type SagaStatusView = {
  sagaId: string;
  numeroOs: string;
  status: string;
  etapaAtual: string;
  correlationId: string;
  iniciadoEm: Date;
  atualizadoEm: Date;
  finalizadoEm: Date | null;
  ultimoErro: string | null;
};

export interface SagaStatusQuery {
  findByOrderNumber(numeroOs: string): Promise<SagaStatusView>;
}
