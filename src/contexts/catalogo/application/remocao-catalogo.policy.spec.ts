import { ApplicationError } from "../../../shared/application/application-error";
import { validarRemocaoPeca, validarRemocaoServico } from "./remocao-catalogo.policy";

describe("Politicas de remocao de catalogo", () => {
  it("permite remover itens sem orcamentos", () => {
    expect(() => validarRemocaoServico(0)).not.toThrow();
    expect(() => validarRemocaoPeca(0)).not.toThrow();
  });

  it("impede remover itens vinculados a orcamentos", () => {
    expect(() => validarRemocaoServico(1)).toThrow(ApplicationError);
    expect(() => validarRemocaoPeca(1)).toThrow(ApplicationError);
  });
});
