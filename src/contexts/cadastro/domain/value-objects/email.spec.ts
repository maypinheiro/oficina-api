import { DomainError } from "../../../../shared/domain/domain-error";
import { Email } from "./email";

describe("Email", () => {
  it("normaliza email para lowercase", () => {
    const email = Email.create(" CLIENTE@EMAIL.COM ");

    expect(email.value).toBe("cliente@email.com");
  });

  it("rejeita email invalido", () => {
    expect(() => Email.create("cliente-email.com")).toThrow(DomainError);
  });
});

