import { atualizarClienteSchema, clienteSchema } from "./cadastro.schemas";

describe("schemas de cliente", () => {
  it("mantem o status ATIVO como responsabilidade do banco na criacao", () => {
    const cliente = clienteSchema.parse({
      nome: "Maria",
      cpfCnpj: "52998224725",
      email: "maria@email.com",
      telefone: "11999999999"
    });

    expect(cliente).not.toHaveProperty("status");
  });

  it.each(["ATIVO", "INATIVO", "BLOQUEADO"])("aceita o status %s na atualizacao", (status) => {
    expect(atualizarClienteSchema.parse({ status })).toEqual({ status });
  });

  it("rejeita status desconhecido", () => {
    expect(() => atualizarClienteSchema.parse({ status: "EXCLUIDO" })).toThrow();
  });

  it("rejeita atualizacao vazia", () => {
    expect(() => atualizarClienteSchema.parse({})).toThrow("Informe ao menos um campo para atualizar");
  });
});
