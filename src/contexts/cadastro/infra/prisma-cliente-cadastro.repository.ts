import { PrismaClient } from "@prisma/client";

import { ApplicationError } from "../../../shared/application/application-error";
import {
  AtualizarClienteInput,
  AtualizarClientePort,
  BuscarClientePorCpfCnpjPort,
  BuscarClientePorIdPort,
  ClienteComVeiculosDto,
  ClienteDto,
  CriarClienteInput,
  CriarClientePort,
  ListarClientesPort,
  RemocaoResultado,
  RemoverClientePort
} from "../application/cadastro.repository";
import { validarRemocaoCliente } from "../application/remocao-cadastro.policy";
import { CpfCnpj } from "../domain/value-objects/cpf-cnpj";
import { Email } from "../domain/value-objects/email";
import { Telefone } from "../domain/value-objects/telefone";
import { buscarClienteObrigatorioPorCpfCnpj } from "./prisma-cadastro-consultas";
import { clienteComVeiculosInclude } from "./prisma-cadastro.mapper";

export class PrismaClienteCadastroRepository
  implements
    CriarClientePort,
    ListarClientesPort,
    BuscarClientePorIdPort,
    BuscarClientePorCpfCnpjPort,
    AtualizarClientePort,
    RemoverClientePort
{
  constructor(private readonly prisma: PrismaClient) {}

  criarCliente(input: CriarClienteInput): Promise<ClienteDto> {
    return this.prisma.cliente.create({
      data: {
        nome: input.nome,
        cpfCnpj: CpfCnpj.create(input.cpfCnpj).value,
        email: Email.create(input.email).value,
        telefone: Telefone.create(input.telefone).value
      }
    });
  }

  listarClientes(): Promise<ClienteDto[]> {
    return this.prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  }

  async buscarClientePorId(id: string): Promise<ClienteComVeiculosDto> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: clienteComVeiculosInclude
    });

    if (!cliente) {
      throw new ApplicationError(404, "Cliente nao encontrado");
    }

    return cliente;
  }

  async buscarClientePorCpfCnpj(cpfCnpj: string): Promise<ClienteDto> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { cpfCnpj: CpfCnpj.create(cpfCnpj).value }
    });

    if (!cliente) {
      throw new ApplicationError(404, "Cliente nao encontrado");
    }

    return cliente;
  }

  async atualizarCliente(cpfCnpj: string, input: AtualizarClienteInput): Promise<ClienteDto> {
    const cliente = await buscarClienteObrigatorioPorCpfCnpj(this.prisma, cpfCnpj);

    return this.prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        ...(input.nome !== undefined ? { nome: input.nome } : {}),
        ...(input.cpfCnpj !== undefined ? { cpfCnpj: CpfCnpj.create(input.cpfCnpj).value } : {}),
        ...(input.email !== undefined ? { email: Email.create(input.email).value } : {}),
        ...(input.telefone !== undefined ? { telefone: Telefone.create(input.telefone).value } : {}),
        ...(input.status !== undefined ? { status: input.status } : {})
      }
    });
  }

  async removerCliente(cpfCnpj: string): Promise<RemocaoResultado> {
    const cliente = await buscarClienteObrigatorioPorCpfCnpj(this.prisma, cpfCnpj);
    const ordens = await this.prisma.ordemDeServico.count({ where: { clienteId: cliente.id } });

    validarRemocaoCliente(ordens);

    await this.prisma.$transaction([
      this.prisma.clienteVeiculo.deleteMany({ where: { clienteId: cliente.id } }),
      this.prisma.cliente.delete({ where: { id: cliente.id } })
    ]);

    return { message: "Cliente removido" };
  }
}
