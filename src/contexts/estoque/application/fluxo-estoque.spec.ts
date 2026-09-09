import { ApplicationError } from "../../../shared/application/application-error";
import { validarLiberacaoReservasDaOs } from "./fluxo-estoque";

describe("Fluxo de estoque", () => {
  it("permite liberar reservas de orcamento rejeitado", () => {
    expect(() => validarLiberacaoReservasDaOs("ORCAMENTO_REJEITADO", "REJEITADO")).not.toThrow();
  });

  it("rejeita liberar reservas antes da rejeicao", () => {
    expect(() => validarLiberacaoReservasDaOs("APROVADA", "APROVADO")).toThrow(ApplicationError);
  });
});
