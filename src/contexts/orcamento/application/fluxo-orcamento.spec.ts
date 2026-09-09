import { ApplicationError } from "../../../shared/application/application-error";
import { validarAprovacaoOrcamento, validarCriacaoOrcamento, validarRejeicaoOrcamento } from "./fluxo-orcamento";

describe("Fluxo de orcamento", () => {
  it("permite operacoes validas", () => {
    expect(() => validarCriacaoOrcamento("AGUARDANDO_APROVACAO", false)).not.toThrow();
    expect(() => validarAprovacaoOrcamento("PENDENTE")).not.toThrow();
    expect(() => validarRejeicaoOrcamento("PENDENTE")).not.toThrow();
  });

  it("rejeita operacoes invalidas", () => {
    expect(() => validarCriacaoOrcamento("RECEBIDA", false)).toThrow(ApplicationError);
    expect(() => validarCriacaoOrcamento("AGUARDANDO_APROVACAO", true)).toThrow(ApplicationError);
    expect(() => validarAprovacaoOrcamento("APROVADO")).toThrow(ApplicationError);
    expect(() => validarRejeicaoOrcamento("REJEITADO")).toThrow(ApplicationError);
  });
});
