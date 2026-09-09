import { ApplicationError } from "../../../shared/application/application-error";
import { validarRemocaoCliente, validarRemocaoVeiculo } from "./remocao-cadastro.policy";

describe("Politicas de remocao de cadastro", () => {
  it("permite remover cadastros sem ordens de servico", () => {
    expect(() => validarRemocaoCliente(0)).not.toThrow();
    expect(() => validarRemocaoVeiculo(0)).not.toThrow();
  });

  it("impede remover cadastros com ordens de servico", () => {
    expect(() => validarRemocaoCliente(1)).toThrow(ApplicationError);
    expect(() => validarRemocaoVeiculo(1)).toThrow(ApplicationError);
  });
});
