import { ConsultarStatusOrdemServicoUseCase } from "../../../contexts/atendimento/application/ordem-servico.use-cases";
import { NotificarDecisaoOrcamentoUseCase } from "../../../contexts/orcamento/application/notificar-decisao-orcamento.use-case";

export type PublicControllerDeps = {
  consultarStatusOrdemServico: ConsultarStatusOrdemServicoUseCase;
  notificarDecisaoOrcamento: NotificarDecisaoOrcamentoUseCase;
};

export class PublicController {
  constructor(private readonly deps: PublicControllerDeps) {}

  consultarStatusOrdemServico(numeroOs: string) {
    return this.deps.consultarStatusOrdemServico.execute(numeroOs);
  }

  notificarDecisaoOrcamento(numeroOs: string, decisao: "APROVADO" | "REJEITADO") {
    return this.deps.notificarDecisaoOrcamento.execute(numeroOs, decisao);
  }
}
