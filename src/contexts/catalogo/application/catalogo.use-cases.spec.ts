import {
  AtualizarEstoqueUseCase,
  AtualizarPecaUseCase,
  AtualizarServicoUseCase,
  ConsultarEstoqueUseCase,
  CriarPecaUseCase,
  CriarServicoUseCase,
  ListarEstoqueUseCase,
  ListarPecasUseCase,
  ListarServicosUseCase,
  RemoverPecaUseCase,
  RemoverServicoUseCase
} from "./catalogo.use-cases";
import { EstoqueCatalogoPort, PecaCatalogoPort, ServicoCatalogoPort } from "./catalogo.repository";

describe("Catalogo use cases", () => {
  const servicos: jest.Mocked<ServicoCatalogoPort> = {
    criarServico: jest.fn(),
    listarServicos: jest.fn(),
    atualizarServico: jest.fn(),
    removerServico: jest.fn()
  };
  const pecas: jest.Mocked<PecaCatalogoPort> = {
    criarPeca: jest.fn(),
    listarPecas: jest.fn(),
    atualizarPeca: jest.fn(),
    removerPeca: jest.fn()
  };
  const estoque: jest.Mocked<EstoqueCatalogoPort> = {
    listarEstoque: jest.fn(),
    consultarEstoque: jest.fn(),
    atualizarEstoque: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it("delegam operacoes para o repositorio", async () => {
    await new CriarServicoUseCase(servicos).execute({ nome: "Troca", preco: 100 });
    await new ListarServicosUseCase(servicos).execute();
    await new AtualizarServicoUseCase(servicos).execute("Troca", { preco: 120 });
    await new RemoverServicoUseCase(servicos).execute("Troca");
    await new CriarPecaUseCase(pecas).execute({ nome: "Peca", preco: 20, quantidade: 2 });
    await new ListarPecasUseCase(pecas).execute();
    await new AtualizarPecaUseCase(pecas).execute("Peca", { quantidade: 5 });
    await new RemoverPecaUseCase(pecas).execute("Peca");
    await new ListarEstoqueUseCase(estoque).execute(true);
    await new ConsultarEstoqueUseCase(estoque).execute("Peca");
    await new AtualizarEstoqueUseCase(estoque).execute("Peca", 3);

    expect(servicos.criarServico).toHaveBeenCalledTimes(1);
    expect(servicos.listarServicos).toHaveBeenCalledTimes(1);
    expect(servicos.atualizarServico).toHaveBeenCalledWith("Troca", { preco: 120 });
    expect(servicos.removerServico).toHaveBeenCalledWith("Troca");
    expect(pecas.criarPeca).toHaveBeenCalledTimes(1);
    expect(pecas.listarPecas).toHaveBeenCalledTimes(1);
    expect(pecas.atualizarPeca).toHaveBeenCalledWith("Peca", { quantidade: 5 });
    expect(pecas.removerPeca).toHaveBeenCalledWith("Peca");
    expect(estoque.listarEstoque).toHaveBeenCalledWith(true);
    expect(estoque.consultarEstoque).toHaveBeenCalledWith("Peca");
    expect(estoque.atualizarEstoque).toHaveBeenCalledWith("Peca", 3);
  });
});
