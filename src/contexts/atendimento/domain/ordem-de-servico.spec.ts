import { DomainError } from "../../../shared/domain/domain-error";
import { OrdemDeServico } from "./ordem-de-servico";
import { StatusOrdemServico } from "./status-ordem-servico";

describe("OrdemDeServico", () => {
  it("cria OS recebida com historico inicial", () => {
    const ordem = OrdemDeServico.create("os-1", {
      numeroOs: "OS-0001",
      clienteId: "cliente-1",
      veiculoId: "veiculo-1",
      descricaoProblemaCliente: "Barulho ao frear"
    });

    expect(ordem.status).toBe(StatusOrdemServico.Recebida);
    expect(ordem.historico).toHaveLength(1);
    expect(ordem.historico[0].status).toBe(StatusOrdemServico.Recebida);
  });

  it("registra diagnostico e move para aguardando aprovacao", () => {
    const ordem = OrdemDeServico.create("os-1", {
      numeroOs: "OS-0001",
      clienteId: "cliente-1",
      veiculoId: "veiculo-1",
      descricaoProblemaCliente: "Barulho ao frear"
    });

    ordem.iniciarDiagnostico();
    ordem.registrarProblemaTecnico("Pastilha de freio gasta");

    expect(ordem.status).toBe(StatusOrdemServico.AguardandoAprovacao);
    expect(ordem.historico).toHaveLength(3);
  });

  it("impede finalizar antes da execucao", () => {
    const ordem = OrdemDeServico.create("os-1", {
      numeroOs: "OS-0001",
      clienteId: "cliente-1",
      veiculoId: "veiculo-1",
      descricaoProblemaCliente: "Barulho ao frear"
    });

    expect(() => ordem.finalizar()).toThrow(DomainError);
  });

  it("impede registrar problema tecnico fora do diagnostico", () => {
    const ordem = OrdemDeServico.create("os-1", {
      numeroOs: "OS-0001",
      clienteId: "cliente-1",
      veiculoId: "veiculo-1",
      descricaoProblemaCliente: "Barulho ao frear"
    });

    expect(() => ordem.registrarProblemaTecnico("Pastilha gasta")).toThrow(DomainError);
  });

  it("impede iniciar execucao antes de aguardando aprovacao", () => {
    const ordem = OrdemDeServico.create("os-1", {
      numeroOs: "OS-0001",
      clienteId: "cliente-1",
      veiculoId: "veiculo-1",
      descricaoProblemaCliente: "Barulho ao frear"
    });

    expect(() => ordem.iniciarExecucao()).toThrow(DomainError);
  });

  it("inicia execucao e finaliza servico registrando historico", () => {
    const ordem = OrdemDeServico.create("os-1", {
      numeroOs: "OS-0001",
      clienteId: "cliente-1",
      veiculoId: "veiculo-1",
      descricaoProblemaCliente: "Barulho ao frear"
    });

    ordem.iniciarDiagnostico();
    ordem.registrarProblemaTecnico("Pastilha de freio gasta");
    ordem.iniciarExecucao();
    ordem.finalizar();

    expect(ordem.status).toBe(StatusOrdemServico.Finalizada);
    expect(ordem.historico).toHaveLength(5);
    expect(ordem.historico[4].dataHora).toBeInstanceOf(Date);
  });
});
