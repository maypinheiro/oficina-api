import { Cliente, PrismaClient, Veiculo } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import {
  consumirQuantidadeReservada,
  PrismaTransactionClient
} from "../../../shared/infra/prisma-estoque-movimentacao";
import { CpfCnpj } from "../../cadastro/domain/value-objects/cpf-cnpj";
import { Placa } from "../../cadastro/domain/value-objects/placa";
import { CriarOrdemServicoInput } from "../application/ordem-servico.repository";

export async function buscarOrdemServicoObrigatoriaPorNumero(
  prisma: Pick<PrismaClient, "ordemDeServico">,
  numeroOs: string
) {
  const ordem = await prisma.ordemDeServico.findUnique({ where: { numeroOs } });

  if (!ordem) {
    throw new ApplicationError(404, "Ordem de servico nao encontrada");
  }

  return ordem;
}

export async function buscarClienteEVeiculoDaOrdem(
  prisma: Pick<PrismaClient, "cliente" | "veiculo">,
  input: Pick<CriarOrdemServicoInput, "cpfCnpj" | "placa">
): Promise<{ cliente: Cliente; veiculo: Veiculo }> {
  const cpfCnpj = CpfCnpj.create(input.cpfCnpj).value;
  const placa = Placa.create(input.placa).value;
  const cliente = await prisma.cliente.findUnique({ where: { cpfCnpj } });
  const veiculo = await prisma.veiculo.findFirst({
    where: {
      placa,
      clientes: {
        some: {
          cliente: { cpfCnpj }
        }
      }
    },
    orderBy: { criadoEm: "desc" }
  });

  if (!cliente) {
    throw new ApplicationError(404, "Cliente nao encontrado");
  }

  if (!veiculo) {
    throw new ApplicationError(404, "Veiculo nao encontrado para o cliente informado");
  }

  return { cliente, veiculo };
}

export async function consumirReservasDoOrcamento(
  tx: PrismaTransactionClient,
  orcamentoId: string
): Promise<void> {
  const pecas = await tx.orcamentoPeca.findMany({ where: { orcamentoId } });

  for (const peca of pecas) {
    await consumirQuantidadeReservada(tx, peca.pecaId, peca.quantidade);
  }
}
