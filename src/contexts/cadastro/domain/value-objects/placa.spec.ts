import { DomainError } from "../../../../shared/domain/domain-error";
import { Placa } from "./placa";

describe("Placa", () => {
  it("aceita placa no padrao Mercosul", () => {
    const placa = Placa.create("abc1d23");

    expect(placa.value).toBe("ABC1D23");
  });

  it("rejeita placa fora do padrao", () => {
    expect(() => Placa.create("ABC123")).toThrow(DomainError);
  });
});

