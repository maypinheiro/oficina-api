import { AprovarOrcamentoUseCase } from "./aprovar-orcamento.use-case";
import { CriarOrcamentoUseCase } from "./criar-orcamento.use-case";
import { NotificarDecisaoOrcamentoUseCase } from "./notificar-decisao-orcamento.use-case";
import { CriarOrcamentoPort, DecidirOrcamentoPort } from "./orcamento.repository";
import { RejeitarOrcamentoUseCase } from "./rejeitar-orcamento.use-case";

describe("Orcamento use cases", () => {
  const criacao: jest.Mocked<CriarOrcamentoPort> = {
    criarComReserva: jest.fn()
  };
  const decisao: jest.Mocked<DecidirOrcamentoPort> = {
    aprovar: jest.fn(),
    rejeitarComDevolucao: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it("delegam operacoes para o repositorio", async () => {
    await new CriarOrcamentoUseCase(criacao).execute({ numeroOs: "OS-1", servicos: [], pecas: [] });
    await new AprovarOrcamentoUseCase(decisao).execute("orcamento-1");
    await new RejeitarOrcamentoUseCase(decisao).execute("orcamento-1");
    await new NotificarDecisaoOrcamentoUseCase(decisao).execute("orcamento-2", "APROVADO");
    await new NotificarDecisaoOrcamentoUseCase(decisao).execute("orcamento-3", "REJEITADO");

    expect(criacao.criarComReserva).toHaveBeenCalledTimes(1);
    expect(decisao.aprovar).toHaveBeenCalledWith("orcamento-1");
    expect(decisao.aprovar).toHaveBeenCalledWith("orcamento-2");
    expect(decisao.rejeitarComDevolucao).toHaveBeenCalledWith("orcamento-1");
    expect(decisao.rejeitarComDevolucao).toHaveBeenCalledWith("orcamento-3");
  });
});
