import { AprovarOrcamentoPort, OrdemServicoComDecisaoOrcamento } from "./orcamento.repository";

export class AprovarOrcamentoUseCase {
  constructor(private readonly orcamentos: AprovarOrcamentoPort) {}

  public execute(numeroOs: string): Promise<OrdemServicoComDecisaoOrcamento> {
    return this.orcamentos.aprovar(numeroOs);
  }
}
