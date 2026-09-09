import { Cliente, PrismaClient, Veiculo } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import { CpfCnpj } from "../domain/value-objects/cpf-cnpj";
import { Placa } from "../domain/value-objects/placa";
import { veiculoComClientesInclude } from "./prisma-cadastro.mapper";
import { VeiculoComClientesDto } from "../application/cadastro.repository";

type CadastroConsultaClient = Pick<PrismaClient, "cliente" | "veiculo">;

export async function buscarClienteObrigatorioPorCpfCnpj(
  prisma: Pick<CadastroConsultaClient, "cliente">,
  cpfCnpj: string
): Promise<Cliente> {
  const cliente = await prisma.cliente.findUnique({
    where: { cpfCnpj: CpfCnpj.create(cpfCnpj).value }
  });

  if (!cliente) {
    throw new ApplicationError(404, "Cliente nao encontrado");
  }

  return cliente;
}

export async function buscarVeiculoUnicoPorPlaca(
  prisma: Pick<CadastroConsultaClient, "veiculo">,
  placa: string
): Promise<Veiculo> {
  const veiculo = await buscarVeiculoOpcionalPorPlaca(prisma, Placa.create(placa).value);

  if (!veiculo) {
    throw new ApplicationError(404, "Veiculo nao encontrado");
  }

  return veiculo;
}

export async function buscarVeiculoOpcionalPorPlaca(
  prisma: Pick<CadastroConsultaClient, "veiculo">,
  placaNormalizada: string
): Promise<Veiculo | null> {
  const veiculos = await prisma.veiculo.findMany({ where: { placa: placaNormalizada } });

  if (veiculos.length > 1) {
    throw new ApplicationError(409, "Placa duplicada no cadastro; ajuste o cadastro para desambiguar");
  }

  return veiculos[0] ?? null;
}

export async function buscarVeiculoComClientesObrigatorioPorId(
  prisma: Pick<CadastroConsultaClient, "veiculo">,
  id: string
): Promise<VeiculoComClientesDto> {
  const veiculo = await prisma.veiculo.findUnique({
    where: { id },
    include: veiculoComClientesInclude
  });

  if (!veiculo) {
    throw new ApplicationError(404, "Veiculo nao encontrado");
  }

  return veiculo;
}
