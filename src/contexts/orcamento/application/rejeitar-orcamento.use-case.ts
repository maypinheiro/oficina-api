import { OrdemServicoComDecisaoOrcamento, RejeitarOrcamentoPort } from "./orcamento.repository";

export class RejeitarOrcamentoUseCase {
  constructor(private readonly orcamentos: RejeitarOrcamentoPort) {}

  public execute(numeroOs: string): Promise<OrdemServicoComDecisaoOrcamento> {
    return this.orcamentos.rejeitarComDevolucao(numeroOs);
  }
}
