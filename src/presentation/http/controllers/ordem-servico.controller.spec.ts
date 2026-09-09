import { OrdemServicoController } from "./ordem-servico.controller";
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

describe("OrdemServicoController", () => {
  const criarOrdem = { execute: jest.fn() } as unknown as CriarOrdemServicoUseCase;
  const listarOrdens = { execute: jest.fn() } as unknown as ListarOrdensServicoUseCase;
  const buscarOrdem = { execute: jest.fn() } as unknown as BuscarOrdemServicoUseCase;
  const consultarStatus = { execute: jest.fn() } as unknown as ConsultarStatusOrdemServicoUseCase;
  const listarHistorico = { execute: jest.fn() } as unknown as ListarHistoricoOrdemServicoUseCase;
  const iniciarDiagnostico = { execute: jest.fn() } as unknown as IniciarDiagnosticoUseCase;
  const registrarProblema = { execute: jest.fn() } as unknown as RegistrarProblemaUseCase;
  const iniciarExecucao = { execute: jest.fn() } as unknown as IniciarExecucaoUseCase;
  const finalizarServico = { execute: jest.fn() } as unknown as FinalizarServicoUseCase;
  const entregarVeiculo = { execute: jest.fn() } as unknown as EntregarVeiculoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates all operations to the use cases", async () => {
    const controller = new OrdemServicoController({
      criarOrdem,
      listarOrdens,
      buscarOrdem,
      consultarStatus,
      listarHistorico,
      iniciarDiagnostico,
      registrarProblema,
      iniciarExecucao,
      finalizarServico,
      entregarVeiculo
    });

    await controller.criar({
      cpfCnpj: "52998224725",
      placa: "ABC1D23",
      descricaoProblemaCliente: "Barulho",
      servicos: ["Troca de pastilha"],
      pecas: []
    });
    await controller.listar({ page: 1, pageSize: 10 });
    await controller.buscar("OS-1");
    await controller.consultarStatus("OS-1");
    await controller.listarHistorico("OS-1");
    await controller.iniciarDiagnostico("OS-1");
    await controller.registrarProblema("OS-1", "Falha");
    await controller.iniciarExecucao("OS-1");
    await controller.finalizar("OS-1");
    await controller.entregar("OS-1");

    expect(criarOrdem.execute).toHaveBeenCalledTimes(1);
    expect(listarOrdens.execute).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
    expect(buscarOrdem.execute).toHaveBeenCalledWith("OS-1");
    expect(consultarStatus.execute).toHaveBeenCalledWith("OS-1");
    expect(listarHistorico.execute).toHaveBeenCalledWith("OS-1");
    expect(iniciarDiagnostico.execute).toHaveBeenCalledWith("OS-1");
    expect(registrarProblema.execute).toHaveBeenCalledWith("OS-1", "Falha");
    expect(iniciarExecucao.execute).toHaveBeenCalledWith("OS-1");
    expect(finalizarServico.execute).toHaveBeenCalledWith("OS-1");
    expect(entregarVeiculo.execute).toHaveBeenCalledWith("OS-1");
  });
});
