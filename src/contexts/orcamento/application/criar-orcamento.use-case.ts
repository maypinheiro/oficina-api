import { CriarOrcamentoInput, CriarOrcamentoPort, OrcamentoCriado } from "./orcamento.repository";

export class CriarOrcamentoUseCase {
  constructor(private readonly orcamentos: CriarOrcamentoPort) {}

  public execute(input: CriarOrcamentoInput): Promise<OrcamentoCriado> {
    return this.orcamentos.criarComReserva(input);
  }
}
