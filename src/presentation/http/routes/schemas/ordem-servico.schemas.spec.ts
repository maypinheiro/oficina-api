import { criarOrdemSchema } from "./ordem-servico.schemas";

describe("criarOrdemSchema", () => {
  it("exige ao menos um servico e aceita pecas vazias", () => {
    const resultado = criarOrdemSchema.safeParse({
      cpfCnpj: "52998224725",
      placa: "ABC1D23",
      descricaoProblemaCliente: "Barulho",
      servicos: ["Troca de pastilha"],
      pecas: []
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita abertura sem servicos", () => {
    const resultado = criarOrdemSchema.safeParse({
      cpfCnpj: "52998224725",
      placa: "ABC1D23",
      descricaoProblemaCliente: "Barulho",
      servicos: [],
      pecas: []
    });

    expect(resultado.success).toBe(false);
  });

  it("rejeita abertura sem o array de pecas", () => {
    const resultado = criarOrdemSchema.safeParse({
      cpfCnpj: "52998224725",
      placa: "ABC1D23",
      descricaoProblemaCliente: "Barulho",
      servicos: ["Troca de pastilha"]
    });

    expect(resultado.success).toBe(false);
  });
});
