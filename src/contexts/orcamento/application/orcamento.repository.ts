export type ValorMonetario = number | { toString(): string };

export type CriarOrcamentoInput = {
  numeroOs: string;
  servicos: string[];
  pecas: Array<{
    nome: string;
    quantidade: number;
  }>;
};

export type OrcamentoServicoDto = {
  id: string;
  orcamentoId: string;
  servicoId: string;
  valor: ValorMonetario;
};

export type OrcamentoPecaDto = {
  id: string;
  orcamentoId: string;
  pecaId: string;
  quantidade: number;
  valorUnitario: ValorMonetario;
};

export type HistoricoStatusDto = {
  id: string;
  ordemServicoId: string;
  status: string;
  dataHora: Date;
};

export type OrcamentoCriado = {
  id: string;
  ordemServicoId: string;
  valorTotal: ValorMonetario;
  status: string;
  criadoEm: Date;
  atualizadoEm: Date;
  servicos: OrcamentoServicoDto[];
  pecas: OrcamentoPecaDto[];
};

export type OrdemServicoComDecisaoOrcamento = {
  id: string;
  numeroOs: string;
  status: string;
  orcamento: OrcamentoCriado | null;
  historico: HistoricoStatusDto[];
};

export type CriarOrcamentoPort = {
  criarComReserva(input: CriarOrcamentoInput): Promise<OrcamentoCriado>;
};

export type AprovarOrcamentoPort = {
  aprovar(numeroOs: string): Promise<OrdemServicoComDecisaoOrcamento>;
};

export type RejeitarOrcamentoPort = {
  rejeitarComDevolucao(numeroOs: string): Promise<OrdemServicoComDecisaoOrcamento>;
};

export type DecidirOrcamentoPort = AprovarOrcamentoPort & RejeitarOrcamentoPort;

export type OrcamentoRepository = CriarOrcamentoPort & DecidirOrcamentoPort;
