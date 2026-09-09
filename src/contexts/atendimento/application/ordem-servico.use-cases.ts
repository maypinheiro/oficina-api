import {
  BuscarOrdemServicoPort,
  ConsultarStatusOrdemServicoPort,
  CriarOrdemServicoPort,
  CriarOrdemServicoInput,
  EntregarVeiculoPort,
  FinalizarServicoPort,
  HistoricoStatusOrdemServico,
  IniciarDiagnosticoPort,
  IniciarExecucaoPort,
  ListarOrdensServicoFiltros,
  ListarHistoricoOrdemServicoPort,
  ListarOrdensServicoPort,
  OrdemServicoComOrcamentoInicial,
  OrdemServicoCriada,
  OrdemServicoDetalhada,
  OrdemServicoResumo,
  OrdemServicoStatusAtualizada,
  RegistrarProblemaPort,
  ResultadoPaginado,
  StatusOrdemServicoConsulta
} from "./ordem-servico.repository";

export class CriarOrdemServicoUseCase {
  constructor(private readonly ordens: CriarOrdemServicoPort) {}

  async execute(input: CriarOrdemServicoInput): Promise<OrdemServicoCriada | OrdemServicoComOrcamentoInicial> {
    const servicos = input.servicos ?? [];
    const pecas = input.pecas ?? [];

    if (servicos.length === 0 && pecas.length === 0) {
      return this.ordens.criar(input);
    }

    return this.ordens.criarComOrcamentoInicial({
      ...input,
      servicos,
      pecas
    });
  }
}

export class ListarOrdensServicoUseCase {
  constructor(private readonly ordens: ListarOrdensServicoPort) {}
  execute(filtros?: ListarOrdensServicoFiltros): Promise<ResultadoPaginado<OrdemServicoResumo>> {
    return this.ordens.listar(filtros);
  }
}

export class BuscarOrdemServicoUseCase {
  constructor(private readonly ordens: BuscarOrdemServicoPort) {}
  execute(numeroOs: string): Promise<OrdemServicoDetalhada> {
    return this.ordens.buscarPorNumero(numeroOs);
  }
}

export class ConsultarStatusOrdemServicoUseCase {
  constructor(private readonly ordens: ConsultarStatusOrdemServicoPort) {}
  execute(numeroOs: string): Promise<StatusOrdemServicoConsulta> {
    return this.ordens.consultarStatus(numeroOs);
  }
}

export class ListarHistoricoOrdemServicoUseCase {
  constructor(private readonly ordens: ListarHistoricoOrdemServicoPort) {}
  execute(numeroOs: string): Promise<HistoricoStatusOrdemServico[]> {
    return this.ordens.listarHistorico(numeroOs);
  }
}

export class IniciarDiagnosticoUseCase {
  constructor(private readonly ordens: IniciarDiagnosticoPort) {}
  execute(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    return this.ordens.iniciarDiagnostico(numeroOs);
  }
}

export class RegistrarProblemaUseCase {
  constructor(private readonly ordens: RegistrarProblemaPort) {}
  execute(numeroOs: string, problemaIdentificado: string): Promise<OrdemServicoStatusAtualizada> {
    return this.ordens.registrarProblema(numeroOs, problemaIdentificado);
  }
}

export class IniciarExecucaoUseCase {
  constructor(private readonly ordens: IniciarExecucaoPort) {}
  execute(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    return this.ordens.iniciarExecucao(numeroOs);
  }
}

export class FinalizarServicoUseCase {
  constructor(private readonly ordens: FinalizarServicoPort) {}
  execute(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    return this.ordens.finalizar(numeroOs);
  }
}

export class EntregarVeiculoUseCase {
  constructor(private readonly ordens: EntregarVeiculoPort) {}
  execute(numeroOs: string): Promise<OrdemServicoStatusAtualizada> {
    return this.ordens.entregar(numeroOs);
  }
}
