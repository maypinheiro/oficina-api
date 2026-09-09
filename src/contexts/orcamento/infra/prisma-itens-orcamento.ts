import { Prisma, PrismaClient } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import { buscarPecaUnicaPorNome, buscarServicoUnicoPorNome } from "../../../shared/infra/prisma-catalogo-consultas";
import { reservarQuantidadeEstoque } from "../../../shared/infra/prisma-estoque-movimentacao";
import { CriarOrcamentoInput } from "../application/orcamento.repository";

type PrismaTransactionClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

type ServicoSelecionado = {
  id: string;
  preco: Prisma.Decimal;
};

type PecaSelecionada = {
  pecaId: string;
  quantidade: number;
  valorUnitario: Prisma.Decimal;
};

export type ItensOrcamentoPreparados = {
  valorTotal: number;
  servicos: ServicoSelecionado[];
  pecas: PecaSelecionada[];
};

export async function prepararItensOrcamentoComReserva(
  tx: PrismaTransactionClient,
  input: Pick<CriarOrcamentoInput, "servicos" | "pecas">
): Promise<ItensOrcamentoPreparados> {
  const servicos = await buscarServicos(tx, input.servicos);
  const pecas = await reservarPecas(tx, input.pecas);
  const valorTotalServicos = servicos.reduce((total, servico) => total + Number(servico.preco), 0);
  const valorTotalPecas = pecas.reduce((total, peca) => total + Number(peca.valorUnitario) * peca.quantidade, 0);

  return {
    valorTotal: valorTotalServicos + valorTotalPecas,
    servicos,
    pecas
  };
}

async function buscarServicos(tx: PrismaTransactionClient, nomes: string[]): Promise<ServicoSelecionado[]> {
  const servicos: ServicoSelecionado[] = [];

  for (const nome of nomes) {
    const servico = await buscarServicoUnicoPorNome(tx, nome, {
      naoEncontrado: "Servico do orcamento nao encontrado",
      duplicado: "Servico duplicado no catalogo; ajuste o cadastro para desambiguar"
    });

    servicos.push({
      id: servico.id,
      preco: servico.preco
    });
  }

  return servicos;
}

async function reservarPecas(
  tx: PrismaTransactionClient,
  itens: Array<{ nome: string; quantidade: number }>
): Promise<PecaSelecionada[]> {
  const pecas: PecaSelecionada[] = [];

  for (const item of itens) {
    const peca = await buscarPecaUnicaPorNome(tx, item.nome, {
      naoEncontrado: "Peca do orcamento nao encontrada",
      duplicado: "Peca duplicada no catalogo; ajuste o cadastro para desambiguar"
    });

    const estoque = await tx.estoque.findUnique({
      where: { pecaId: peca.id },
      include: { peca: true }
    });

    if (!estoque) {
      throw new ApplicationError(404, "Peca do orcamento nao encontrada");
    }

    await reservarQuantidadeEstoque(tx, estoque.pecaId, item.quantidade);

    pecas.push({
      pecaId: estoque.pecaId,
      quantidade: item.quantidade,
      valorUnitario: estoque.peca.preco
    });
  }

  return pecas;
}
