import { PrismaClient } from "@prisma/client";

import { buscarPecaUnicaPorNome } from "../../../shared/infra/prisma-catalogo-consultas";
import {
  AtualizarPecaInput,
  AtualizarPecaPort,
  CriarPecaInput,
  CriarPecaPort,
  ListarPecasPort,
  PecaComEstoqueDto,
  RemocaoResultado,
  RemoverPecaPort
} from "../application/catalogo.repository";
import { validarRemocaoPeca } from "../application/remocao-catalogo.policy";
import { mapPecaComAlertaEstoque, pecaComEstoqueInclude } from "./prisma-catalogo.mapper";

export class PrismaPecaCatalogoRepository implements CriarPecaPort, ListarPecasPort, AtualizarPecaPort, RemoverPecaPort {
  constructor(private readonly prisma: PrismaClient) {}

  criarPeca(input: CriarPecaInput): Promise<PecaComEstoqueDto> {
    return this.prisma.peca.create({
      data: {
        nome: input.nome,
        preco: input.preco,
        quantidade: input.quantidade,
        estoqueMinimo: input.estoqueMinimo ?? 5,
        estoque: {
          create: {
            quantidadeDisponivel: input.quantidade,
            quantidadeReservada: 0
          }
        }
      },
      include: pecaComEstoqueInclude
    }).then(mapPecaComAlertaEstoque);
  }

  listarPecas(): Promise<PecaComEstoqueDto[]> {
    return this.prisma.peca.findMany({
      include: pecaComEstoqueInclude,
      orderBy: { nome: "asc" }
    }).then((pecas) => pecas.map(mapPecaComAlertaEstoque));
  }

  async atualizarPeca(nome: string, input: AtualizarPecaInput): Promise<PecaComEstoqueDto> {
    const pecaAtual = await buscarPecaUnicaPorNome(this.prisma, nome);

    const peca = await this.prisma.peca.update({
      where: { id: pecaAtual.id },
      data: {
        ...(input.nome !== undefined ? { nome: input.nome } : {}),
        ...(input.preco !== undefined ? { preco: input.preco } : {}),
        ...(input.quantidade !== undefined ? { quantidade: input.quantidade } : {}),
        ...(input.estoqueMinimo !== undefined ? { estoqueMinimo: input.estoqueMinimo } : {}),
        ...(input.quantidade !== undefined
          ? {
              estoque: {
                upsert: {
                  create: { quantidadeDisponivel: input.quantidade, quantidadeReservada: 0 },
                  update: { quantidadeDisponivel: input.quantidade }
                }
              }
            }
          : {})
      },
      include: pecaComEstoqueInclude
    });

    return mapPecaComAlertaEstoque(peca);
  }

  async removerPeca(nome: string): Promise<RemocaoResultado> {
    const peca = await buscarPecaUnicaPorNome(this.prisma, nome);
    const orcamentos = await this.prisma.orcamentoPeca.count({ where: { pecaId: peca.id } });

    validarRemocaoPeca(orcamentos);

    await this.prisma.$transaction([
      this.prisma.estoque.deleteMany({ where: { pecaId: peca.id } }),
      this.prisma.peca.delete({ where: { id: peca.id } })
    ]);

    return { message: "Peca removida" };
  }
}
