import { DomainError } from "../../../shared/domain/domain-error";
import { Orcamento } from "./orcamento";
import { StatusOrcamento } from "./status-orcamento";

describe("Orcamento", () => {
  it("cria orcamento pendente", () => {
    const orcamento = Orcamento.create("orcamento-1", {
      ordemServicoId: "os-1",
      valorTotal: 100
    });

    expect(orcamento.status).toBe(StatusOrcamento.Pendente);
  });

  it("aprova orcamento pendente", () => {
    const orcamento = Orcamento.create("orcamento-1", {
      ordemServicoId: "os-1",
      valorTotal: 100
    });

    orcamento.aprovar();

    expect(orcamento.status).toBe(StatusOrcamento.Aprovado);
  });

  it("impede rejeitar orcamento ja aprovado", () => {
    const orcamento = Orcamento.create("orcamento-1", {
      ordemServicoId: "os-1",
      valorTotal: 100
    });

    orcamento.aprovar();

    expect(() => orcamento.rejeitar()).toThrow(DomainError);
  });

  it("rejeita orcamento com valor negativo", () => {
    expect(() =>
      Orcamento.create("orcamento-1", {
        ordemServicoId: "os-1",
        valorTotal: -1
      })
    ).toThrow(DomainError);
  });

  it("rejeita orcamento pendente", () => {
    const orcamento = Orcamento.create("orcamento-1", {
      ordemServicoId: "os-1",
      valorTotal: 100
    });

    orcamento.rejeitar();

    expect(orcamento.status).toBe(StatusOrcamento.Rejeitado);
  });

  it("impede aprovar orcamento ja rejeitado", () => {
    const orcamento = Orcamento.create("orcamento-1", {
      ordemServicoId: "os-1",
      valorTotal: 100
    });

    orcamento.rejeitar();

    expect(() => orcamento.aprovar()).toThrow(DomainError);
  });
});
