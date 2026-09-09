import { Estoque, PrismaClient } from "@prisma/client";

import { ApplicationError } from "../application/application-error";

export type PrismaTransactionClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

type EstoqueOperacaoClient = {
  estoque: {
    findUnique(args: { where: { pecaId: string } }): Promise<Estoque | null>;
    update(args: {
      where: { pecaId: string };
      data: {
        quantidadeDisponivel?: { decrement?: number; increment?: number };
        quantidadeReservada?: { decrement?: number; increment?: number };
      };
    }): Promise<Estoque>;
  };
};

export async function reservarQuantidadeEstoque(
  prisma: EstoqueOperacaoClient,
  pecaId: string,
  quantidade: number
): Promise<void> {
  const estoque = await prisma.estoque.findUnique({ where: { pecaId } });

  if (!estoque || estoque.quantidadeDisponivel < quantidade) {
    throw new ApplicationError(422, "Estoque insuficiente para reserva");
  }

  await prisma.estoque.update({
    where: { pecaId },
    data: {
      quantidadeDisponivel: { decrement: quantidade },
      quantidadeReservada: { increment: quantidade }
    }
  });
}

export async function liberarQuantidadeReservada(
  prisma: EstoqueOperacaoClient,
  pecaId: string,
  quantidade: number
): Promise<void> {
  const estoque = await prisma.estoque.findUnique({ where: { pecaId } });

  if (!estoque || estoque.quantidadeReservada < quantidade) {
    throw new ApplicationError(422, "Reserva insuficiente para liberacao");
  }

  await prisma.estoque.update({
    where: { pecaId },
    data: {
      quantidadeDisponivel: { increment: quantidade },
      quantidadeReservada: { decrement: quantidade }
    }
  });
}

export async function consumirQuantidadeReservada(
  prisma: EstoqueOperacaoClient,
  pecaId: string,
  quantidade: number
): Promise<void> {
  const estoque = await prisma.estoque.findUnique({ where: { pecaId } });

  if (!estoque || estoque.quantidadeReservada < quantidade) {
    throw new ApplicationError(422, "Reserva insuficiente para consumo");
  }

  await prisma.estoque.update({
    where: { pecaId },
    data: {
      quantidadeReservada: { decrement: quantidade }
    }
  });
}
