import { AprovarOrcamentoUseCase } from "../../../contexts/orcamento/application/aprovar-orcamento.use-case";
import { CriarOrcamentoUseCase } from "../../../contexts/orcamento/application/criar-orcamento.use-case";
import { NotificarDecisaoOrcamentoUseCase } from "../../../contexts/orcamento/application/notificar-decisao-orcamento.use-case";
import { RejeitarOrcamentoUseCase } from "../../../contexts/orcamento/application/rejeitar-orcamento.use-case";
import { OrcamentoController } from "./orcamento.controller";

describe("OrcamentoController", () => {
  const criarOrcamento = { execute: jest.fn() } as unknown as CriarOrcamentoUseCase;
  const aprovarOrcamento = { execute: jest.fn() } as unknown as AprovarOrcamentoUseCase;
  const rejeitarOrcamento = { execute: jest.fn() } as unknown as RejeitarOrcamentoUseCase;
  const notificarDecisao = { execute: jest.fn() } as unknown as NotificarDecisaoOrcamentoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates all operations to the use cases", async () => {
    const controller = new OrcamentoController({
      criarOrcamento,
      aprovarOrcamento,
      rejeitarOrcamento,
      notificarDecisao
    });

    await controller.criar({ numeroOs: "OS-1", servicos: ["Troca"], pecas: [] });
    await controller.notificarDecisao("OS-1", "APROVADO");
    await controller.aprovar("OS-1");
    await controller.rejeitar("OS-1");

    expect(criarOrcamento.execute).toHaveBeenCalledWith({ numeroOs: "OS-1", servicos: ["Troca"], pecas: [] });
    expect(notificarDecisao.execute).toHaveBeenCalledWith("OS-1", "APROVADO");
    expect(aprovarOrcamento.execute).toHaveBeenCalledWith("OS-1");
    expect(rejeitarOrcamento.execute).toHaveBeenCalledWith("OS-1");
  });
});
