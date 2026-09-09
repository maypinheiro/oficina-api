import { Email } from "../../contexts/cadastro/domain/value-objects/email";

describe("ValueObject", () => {
  it("compara value objects pelo valor interno", () => {
    const email = Email.create("cliente@email.com");
    const outroEmail = Email.create("CLIENTE@EMAIL.COM");

    expect(email.equals(outroEmail)).toBe(true);
  });
});

