import { ConsultarStatusOrdemServicoUseCase } from "../../../contexts/atendimento/application/ordem-servico.use-cases";
import { NotificarDecisaoOrcamentoUseCase } from "../../../contexts/orcamento/application/notificar-decisao-orcamento.use-case";
import { PublicController } from "./public.controller";

describe("PublicController", () => {
  const consultarStatusOrdemServico = {
    execute: jest.fn()
  } as unknown as ConsultarStatusOrdemServicoUseCase;
  const notificarDecisaoOrcamento = { execute: jest.fn() } as unknown as NotificarDecisaoOrcamentoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates public operations to the repositories and use cases", async () => {
    const controller = new PublicController({
      consultarStatusOrdemServico,
      notificarDecisaoOrcamento
    });

    await controller.consultarStatusOrdemServico("OS-1");
    await controller.notificarDecisaoOrcamento("OS-1", "REJEITADO");

    expect(consultarStatusOrdemServico.execute).toHaveBeenCalledWith("OS-1");
    expect(notificarDecisaoOrcamento.execute).toHaveBeenCalledWith("OS-1", "REJEITADO");
  });
});
