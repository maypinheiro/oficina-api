import { DomainError } from "../../../../shared/domain/domain-error";
import { Telefone } from "./telefone";

describe("Telefone", () => {
  it("normaliza telefone brasileiro", () => {
    const telefone = Telefone.create("(11) 99999-9999");

    expect(telefone.value).toBe("11999999999");
  });

  it("rejeita telefone com tamanho invalido", () => {
    expect(() => Telefone.create("999")).toThrow(DomainError);
  });
});

