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
} from "./ordem-servico.use-cases";
import {
  AtualizarStatusOrdemServicoPort,
  BuscarOrdemServicoPort,
  ConsultarStatusOrdemServicoPort,
  CriarOrdemServicoPort,
  ListarHistoricoOrdemServicoPort,
  ListarOrdensServicoPort
} from "./ordem-servico.repository";

describe("Ordem de servico use cases", () => {
  const orcamentoInicial = {
    id: "orcamento-1",
    ordemServicoId: "ordem-1",
    valorTotal: 120,
    status: "PENDENTE",
    servicos: [],
    pecas: []
  };
  const criacao: jest.Mocked<CriarOrdemServicoPort> = {
    criar: jest.fn(),
    criarComOrcamentoInicial: jest.fn()
  };
  const listagem: jest.Mocked<ListarOrdensServicoPort> = {
    listar: jest.fn()
  };
  const busca: jest.Mocked<BuscarOrdemServicoPort> = {
    buscarPorNumero: jest.fn()
  };
  const status: jest.Mocked<ConsultarStatusOrdemServicoPort> = {
    consultarStatus: jest.fn()
  };
  const historico: jest.Mocked<ListarHistoricoOrdemServicoPort> = {
    listarHistorico: jest.fn()
  };
  const atualizacaoStatus: jest.Mocked<AtualizarStatusOrdemServicoPort> = {
    iniciarDiagnostico: jest.fn(),
    registrarProblema: jest.fn(),
    iniciarExecucao: jest.fn(),
    finalizar: jest.fn(),
    entregar: jest.fn()
  };
  beforeEach(() => {
    jest.clearAllMocks();
    criacao.criar.mockResolvedValue({ numeroOs: "OS-1" });
    criacao.criarComOrcamentoInicial.mockResolvedValue({
      ordemServico: { numeroOs: "OS-1" },
      orcamento: orcamentoInicial
    });
  });

  it("delegam operacoes para o repositorio", async () => {
    await new CriarOrdemServicoUseCase(criacao).execute({
      cpfCnpj: "52998224725",
      placa: "ABC1D23",
      descricaoProblemaCliente: "Barulho"
    });
    await new ListarOrdensServicoUseCase(listagem).execute();
    await new BuscarOrdemServicoUseCase(busca).execute("os-1");
    await new ConsultarStatusOrdemServicoUseCase(status).execute("os-1");
    await new ListarHistoricoOrdemServicoUseCase(historico).execute("os-1");
    await new IniciarDiagnosticoUseCase(atualizacaoStatus).execute("os-1");
    await new RegistrarProblemaUseCase(atualizacaoStatus).execute("os-1", "Falha");
    await new IniciarExecucaoUseCase(atualizacaoStatus).execute("os-1");
    await new FinalizarServicoUseCase(atualizacaoStatus).execute("os-1");
    await new EntregarVeiculoUseCase(atualizacaoStatus).execute("os-1");

    expect(criacao.criar).toHaveBeenCalledTimes(1);
    expect(listagem.listar).toHaveBeenCalledTimes(1);
    expect(busca.buscarPorNumero).toHaveBeenCalledWith("os-1");
    expect(status.consultarStatus).toHaveBeenCalledWith("os-1");
    expect(historico.listarHistorico).toHaveBeenCalledWith("os-1");
    expect(atualizacaoStatus.iniciarDiagnostico).toHaveBeenCalledWith("os-1");
    expect(atualizacaoStatus.registrarProblema).toHaveBeenCalledWith("os-1", "Falha");
    expect(atualizacaoStatus.iniciarExecucao).toHaveBeenCalledWith("os-1");
    expect(atualizacaoStatus.finalizar).toHaveBeenCalledWith("os-1");
    expect(atualizacaoStatus.entregar).toHaveBeenCalledWith("os-1");
  });

  it("abre OS com orcamento inicial quando servicos e pecas sao informados", async () => {
    const input = {
      cpfCnpj: "52998224725",
      placa: "ABC1D23",
      descricaoProblemaCliente: "Barulho",
      servicos: ["Troca de oleo"],
      pecas: [{ nome: "Filtro de oleo", quantidade: 1 }]
    };

    const resultado = await new CriarOrdemServicoUseCase(criacao).execute(input);

    expect(criacao.criar).not.toHaveBeenCalled();
    expect(criacao.criarComOrcamentoInicial).toHaveBeenCalledWith(input);
    expect(atualizacaoStatus.iniciarDiagnostico).not.toHaveBeenCalled();
    expect(atualizacaoStatus.registrarProblema).not.toHaveBeenCalled();
    expect(resultado).toEqual({
      ordemServico: { numeroOs: "OS-1" },
      orcamento: orcamentoInicial
    });
  });
});
