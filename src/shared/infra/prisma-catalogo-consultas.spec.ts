import { ApplicationError } from "../application/application-error";
import { buscarPecaUnicaPorNome, buscarServicoUnicoPorNome } from "./prisma-catalogo-consultas";

describe("Prisma catalogo consultas", () => {
  it("busca servico unico por nome", async () => {
    const prisma = {
      servico: {
        findMany: jest.fn().mockResolvedValue([{ id: "servico-1", nome: "Troca", preco: 10 }])
      }
    };

    await expect(buscarServicoUnicoPorNome(prisma, "Troca")).resolves.toMatchObject({ id: "servico-1" });
  });

  it("rejeita servico duplicado", async () => {
    const prisma = {
      servico: {
        findMany: jest.fn().mockResolvedValue([{ id: "1" }, { id: "2" }])
      }
    };

    await expect(buscarServicoUnicoPorNome(prisma, "Troca")).rejects.toThrow(ApplicationError);
  });

  it("busca peca unica por nome", async () => {
    const prisma = {
      peca: {
        findMany: jest.fn().mockResolvedValue([{ id: "peca-1", nome: "Filtro", preco: 10 }])
      }
    };

    await expect(buscarPecaUnicaPorNome(prisma, "Filtro")).resolves.toMatchObject({ id: "peca-1" });
  });
});
