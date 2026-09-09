import { PrismaClient } from "@prisma/client";

import {
  buscarPecaComEstoqueUnicaPorNome,
  buscarPecaUnicaPorNome
} from "../../../shared/infra/prisma-catalogo-consultas";
import {
  AtualizarEstoquePort,
  ConsultarEstoquePort,
  ListarEstoquePort,
  PecaComEstoqueDto
} from "../application/catalogo.repository";
import { mapPecaComAlertaEstoque, pecaComEstoqueInclude } from "./prisma-catalogo.mapper";

export class PrismaEstoqueCatalogoRepository implements ListarEstoquePort, ConsultarEstoquePort, AtualizarEstoquePort {
  constructor(private readonly prisma: PrismaClient) {}

  async listarEstoque(apenasBaixo = false): Promise<PecaComEstoqueDto[]> {
    const pecas = await this.prisma.peca.findMany({
      include: pecaComEstoqueInclude,
      orderBy: { nome: "asc" }
    });

    const resultado = pecas.map(mapPecaComAlertaEstoque);

    return apenasBaixo ? resultado.filter((peca) => peca.estoqueBaixo) : resultado;
  }

  async consultarEstoque(nome: string): Promise<PecaComEstoqueDto> {
    const peca = await buscarPecaComEstoqueUnicaPorNome(this.prisma, nome);

    return mapPecaComAlertaEstoque(peca);
  }

  atualizarEstoque(nome: string, quantidadeDisponivel: number): Promise<PecaComEstoqueDto> {
    return this.prisma.$transaction(async (tx) => {
      const pecaAtual = await buscarPecaUnicaPorNome(tx, nome);

      const peca = await tx.peca.update({
        where: { id: pecaAtual.id },
        data: {
          quantidade: quantidadeDisponivel,
          estoque: {
            update: { quantidadeDisponivel }
          }
        },
        include: pecaComEstoqueInclude
      });

      return mapPecaComAlertaEstoque(peca);
    });
  }
}
