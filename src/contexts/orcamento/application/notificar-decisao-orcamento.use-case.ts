import { DecidirOrcamentoPort, OrdemServicoComDecisaoOrcamento } from "./orcamento.repository";

export type DecisaoOrcamento = "APROVADO" | "REJEITADO";

export class NotificarDecisaoOrcamentoUseCase {
  constructor(private readonly orcamentos: DecidirOrcamentoPort) {}

  public execute(numeroOs: string, decisao: DecisaoOrcamento): Promise<OrdemServicoComDecisaoOrcamento> {
    if (decisao === "APROVADO") {
      return this.orcamentos.aprovar(numeroOs);
    }

    return this.orcamentos.rejeitarComDevolucao(numeroOs);
  }
}
