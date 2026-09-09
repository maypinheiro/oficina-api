import { PrismaClient } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import {
  AtualizarVeiculoInput,
  AtualizarVeiculoPort,
  CriarVeiculoInput,
  CriarVeiculoPort,
  ListarVeiculosPort,
  RemocaoResultado,
  RemoverVeiculoPort,
  VeiculoComClientesDto
} from "../application/cadastro.repository";
import { validarRemocaoVeiculo } from "../application/remocao-cadastro.policy";
import { CpfCnpj } from "../domain/value-objects/cpf-cnpj";
import { Placa } from "../domain/value-objects/placa";
import {
  buscarVeiculoComClientesObrigatorioPorId,
  buscarVeiculoOpcionalPorPlaca,
  buscarVeiculoUnicoPorPlaca
} from "./prisma-cadastro-consultas";
import { veiculoComClientesInclude } from "./prisma-cadastro.mapper";

export class PrismaVeiculoCadastroRepository
  implements CriarVeiculoPort, ListarVeiculosPort, AtualizarVeiculoPort, RemoverVeiculoPort
{
  constructor(private readonly prisma: PrismaClient) {}

  async criarVeiculo(input: CriarVeiculoInput): Promise<VeiculoComClientesDto> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { cpfCnpj: CpfCnpj.create(input.cpfCnpj).value }
    });

    if (!cliente) {
      throw new ApplicationError(404, "Cliente nao encontrado");
    }

    const placa = Placa.create(input.placa).value;
    const veiculo = await buscarVeiculoOpcionalPorPlaca(this.prisma, placa);

    if (veiculo) {
      await this.prisma.clienteVeiculo.upsert({
        where: {
          clienteId_veiculoId: {
            clienteId: cliente.id,
            veiculoId: veiculo.id
          }
        },
        update: {},
        create: {
          clienteId: cliente.id,
          veiculoId: veiculo.id
        }
      });

      return buscarVeiculoComClientesObrigatorioPorId(this.prisma, veiculo.id);
    }

    return this.prisma.veiculo.create({
      data: {
        placa,
        marca: input.marca,
        modelo: input.modelo,
        ano: input.ano,
        clientes: {
          create: {
            clienteId: cliente.id
          }
        }
      },
      include: veiculoComClientesInclude
    });
  }

  listarVeiculos(): Promise<VeiculoComClientesDto[]> {
    return this.prisma.veiculo.findMany({
      include: veiculoComClientesInclude,
      orderBy: { criadoEm: "desc" }
    });
  }

  async atualizarVeiculo(placa: string, input: AtualizarVeiculoInput): Promise<VeiculoComClientesDto> {
    const veiculo = await buscarVeiculoUnicoPorPlaca(this.prisma, placa);

    return this.prisma.veiculo.update({
      where: { id: veiculo.id },
      data: {
        ...(input.placa !== undefined ? { placa: Placa.create(input.placa).value } : {}),
        ...(input.marca !== undefined ? { marca: input.marca } : {}),
        ...(input.modelo !== undefined ? { modelo: input.modelo } : {}),
        ...(input.ano !== undefined ? { ano: input.ano } : {})
      },
      include: veiculoComClientesInclude
    });
  }

  async removerVeiculo(placa: string): Promise<RemocaoResultado> {
    const veiculo = await buscarVeiculoUnicoPorPlaca(this.prisma, placa);
    const ordens = await this.prisma.ordemDeServico.count({ where: { veiculoId: veiculo.id } });

    validarRemocaoVeiculo(ordens);

    await this.prisma.$transaction([
      this.prisma.clienteVeiculo.deleteMany({ where: { veiculoId: veiculo.id } }),
      this.prisma.veiculo.delete({ where: { id: veiculo.id } })
    ]);

    return { message: "Veiculo removido" };
  }
}
