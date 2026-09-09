import { DomainError } from "../../../../shared/domain/domain-error";
import { CpfCnpj } from "./cpf-cnpj";

describe("CpfCnpj", () => {
  it("normaliza CPF removendo caracteres nao numericos", () => {
    const cpf = CpfCnpj.create("529.982.247-25");

    expect(cpf.value).toBe("52998224725");
  });

  it("normaliza CNPJ valido removendo caracteres nao numericos", () => {
    const cnpj = CpfCnpj.create("04.252.011/0001-10");

    expect(cnpj.value).toBe("04252011000110");
  });

  it("rejeita CPF/CNPJ com tamanho invalido", () => {
    expect(() => CpfCnpj.create("123")).toThrow(DomainError);
  });

  it("rejeita CPF/CNPJ com digito verificador invalido", () => {
    expect(() => CpfCnpj.create("123.456.789-01")).toThrow(DomainError);
    expect(() => CpfCnpj.create("11.111.111/1111-11")).toThrow(DomainError);
  });
});
