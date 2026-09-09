import { PrismaClient } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import { buscarPecaUnicaPorNome } from "../../../shared/infra/prisma-catalogo-consultas";
import {
  consumirQuantidadeReservada,
  liberarQuantidadeReservada,
  reservarQuantidadeEstoque
} from "../../../shared/infra/prisma-estoque-movimentacao";
import { validarLiberacaoReservasDaOs } from "../application/fluxo-estoque";
import { EstoqueAtualizado, EstoqueRepository, OrdemComReservasLiberadas } from "../application/estoque.repository";

export class PrismaEstoqueRepository implements EstoqueRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async reservarPeca(nome: string, quantidade: number): Promise<EstoqueAtualizado> {
    const estoque = await this.buscarEstoque(nome);

    await reservarQuantidadeEstoque(this.prisma, estoque.pecaId, quantidade);

    return this.buscarEstoque(nome);
  }

  async liberarPecaReservada(nome: string, quantidade: number): Promise<EstoqueAtualizado> {
    const estoque = await this.buscarEstoque(nome);

    await liberarQuantidadeReservada(this.prisma, estoque.pecaId, quantidade);

    return this.buscarEstoque(nome);
  }

  liberarReservasDaOs(numeroOs: string): Promise<OrdemComReservasLiberadas> {
    return this.prisma.$transaction(async (tx) => {
      const ordem = await tx.ordemDeServico.findUnique({
        where: { numeroOs },
        include: { orcamento: { include: { pecas: true } } }
      });

      if (!ordem || !ordem.orcamento) {
        throw new ApplicationError(404, "OS ou orcamento nao encontrado");
      }

      validarLiberacaoReservasDaOs(ordem.status, ordem.orcamento.status);

      for (const peca of ordem.orcamento.pecas) {
        await liberarQuantidadeReservada(tx, peca.pecaId, peca.quantidade);
      }

      return tx.ordemDeServico.findUnique({
        where: { numeroOs },
        include: { orcamento: { include: { pecas: true } } }
      });
    });
  }

  async consumirPeca(nome: string, quantidade: number): Promise<EstoqueAtualizado> {
    const estoque = await this.buscarEstoque(nome);

    await consumirQuantidadeReservada(this.prisma, estoque.pecaId, quantidade);

    return this.buscarEstoque(nome);
  }

  private async buscarEstoque(nome: string) {
    const peca = await buscarPecaUnicaPorNome(this.prisma, nome);
    const estoque = await this.prisma.estoque.findUnique({ where: { pecaId: peca.id } });

    if (!estoque) {
      throw new ApplicationError(404, "Estoque da peca nao encontrado");
    }

    return estoque;
  }
}
