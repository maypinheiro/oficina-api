import {
  BuscarOrdemServicoUseCase,
  ConsultarStatusOrdemServicoUseCase,
  CriarOrdemServicoUseCase,
  EntregarVeiculoUseCase,
  FinalizarServicoUseCase,
  IniciarDiagnosticoUseCase,
  IniciarExecucaoUseCase,
  ListarHistoricoOrdemServicoUseCase,
  ListarOrdensServicoUseCase,
  RegistrarProblemaUseCase
} from "../../../contexts/atendimento/application/ordem-servico.use-cases";
import {
  CriarOrdemServicoInput,
  ListarOrdensServicoFiltros
} from "../../../contexts/atendimento/application/ordem-servico.repository";

export type OrdemServicoControllerDeps = {
  criarOrdem: CriarOrdemServicoUseCase;
  listarOrdens: ListarOrdensServicoUseCase;
  buscarOrdem: BuscarOrdemServicoUseCase;
  consultarStatus: ConsultarStatusOrdemServicoUseCase;
  listarHistorico: ListarHistoricoOrdemServicoUseCase;
  iniciarDiagnostico: IniciarDiagnosticoUseCase;
  registrarProblema: RegistrarProblemaUseCase;
  iniciarExecucao: IniciarExecucaoUseCase;
  finalizarServico: FinalizarServicoUseCase;
  entregarVeiculo: EntregarVeiculoUseCase;
};

export class OrdemServicoController {
  constructor(private readonly deps: OrdemServicoControllerDeps) {}

  criar(input: CriarOrdemServicoInput) {
    return this.deps.criarOrdem.execute(input);
  }

  listar(filtros?: ListarOrdensServicoFiltros) {
    return this.deps.listarOrdens.execute(filtros);
  }

  buscar(numeroOs: string) {
    return this.deps.buscarOrdem.execute(numeroOs);
  }

  consultarStatus(numeroOs: string) {
    return this.deps.consultarStatus.execute(numeroOs);
  }

  listarHistorico(numeroOs: string) {
    return this.deps.listarHistorico.execute(numeroOs);
  }

  iniciarDiagnostico(numeroOs: string) {
    return this.deps.iniciarDiagnostico.execute(numeroOs);
  }

  registrarProblema(numeroOs: string, problemaIdentificado: string) {
    return this.deps.registrarProblema.execute(numeroOs, problemaIdentificado);
  }

  iniciarExecucao(numeroOs: string) {
    return this.deps.iniciarExecucao.execute(numeroOs);
  }

  finalizar(numeroOs: string) {
    return this.deps.finalizarServico.execute(numeroOs);
  }

  entregar(numeroOs: string) {
    return this.deps.entregarVeiculo.execute(numeroOs);
  }
}
