import { AprovarOrcamentoUseCase } from "../../../contexts/orcamento/application/aprovar-orcamento.use-case";
import { CriarOrcamentoUseCase } from "../../../contexts/orcamento/application/criar-orcamento.use-case";
import { DecisaoOrcamento, NotificarDecisaoOrcamentoUseCase } from "../../../contexts/orcamento/application/notificar-decisao-orcamento.use-case";
import { RejeitarOrcamentoUseCase } from "../../../contexts/orcamento/application/rejeitar-orcamento.use-case";
import { CriarOrcamentoInput } from "../../../contexts/orcamento/application/orcamento.repository";

export type OrcamentoControllerDeps = {
  criarOrcamento: CriarOrcamentoUseCase;
  aprovarOrcamento: AprovarOrcamentoUseCase;
  rejeitarOrcamento: RejeitarOrcamentoUseCase;
  notificarDecisao: NotificarDecisaoOrcamentoUseCase;
};

export class OrcamentoController {
  constructor(private readonly deps: OrcamentoControllerDeps) {}

  criar(input: CriarOrcamentoInput) {
    return this.deps.criarOrcamento.execute(input);
  }

  notificarDecisao(numeroOs: string, decisao: DecisaoOrcamento) {
    return this.deps.notificarDecisao.execute(numeroOs, decisao);
  }

  aprovar(numeroOs: string) {
    return this.deps.aprovarOrcamento.execute(numeroOs);
  }

  rejeitar(numeroOs: string) {
    return this.deps.rejeitarOrcamento.execute(numeroOs);
  }
}
