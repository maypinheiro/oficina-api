import {
  consumirQuantidadeReservada,
  liberarQuantidadeReservada,
  reservarQuantidadeEstoque
} from "./prisma-estoque-movimentacao";

describe("Prisma estoque movimentacao", () => {
  it("reserva quantidade disponivel", async () => {
    const prisma = criarPrismaEstoqueMock({ quantidadeDisponivel: 5, quantidadeReservada: 0 });

    await reservarQuantidadeEstoque(prisma, "peca-1", 2);

    expect(prisma.estoque.update).toHaveBeenCalledWith({
      where: { pecaId: "peca-1" },
      data: {
        quantidadeDisponivel: { decrement: 2 },
        quantidadeReservada: { increment: 2 }
      }
    });
  });

  it("libera quantidade reservada", async () => {
    const prisma = criarPrismaEstoqueMock({ quantidadeDisponivel: 1, quantidadeReservada: 3 });

    await liberarQuantidadeReservada(prisma, "peca-1", 2);

    expect(prisma.estoque.update).toHaveBeenCalledWith({
      where: { pecaId: "peca-1" },
      data: {
        quantidadeDisponivel: { increment: 2 },
        quantidadeReservada: { decrement: 2 }
      }
    });
  });

  it("consome quantidade reservada", async () => {
    const prisma = criarPrismaEstoqueMock({ quantidadeDisponivel: 1, quantidadeReservada: 3 });

    await consumirQuantidadeReservada(prisma, "peca-1", 2);

    expect(prisma.estoque.update).toHaveBeenCalledWith({
      where: { pecaId: "peca-1" },
      data: {
        quantidadeReservada: { decrement: 2 }
      }
    });
  });

  function criarPrismaEstoqueMock(estoque: { quantidadeDisponivel: number; quantidadeReservada: number }) {
    return {
      estoque: {
        findUnique: jest.fn().mockResolvedValue({ pecaId: "peca-1", ...estoque }),
        update: jest.fn().mockResolvedValue({ pecaId: "peca-1", ...estoque })
      }
    };
  }
});
