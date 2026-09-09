import { PrismaClient } from "@prisma/client";

import {
  AtualizarClienteInput,
  AtualizarVeiculoInput,
  CadastroRepository,
  ClienteComVeiculosDto,
  ClienteDto,
  CriarClienteInput,
  CriarVeiculoInput,
  RemocaoResultado,
  VeiculoComClientesDto
} from "../application/cadastro.repository";
import { PrismaClienteCadastroRepository } from "./prisma-cliente-cadastro.repository";
import { PrismaVeiculoCadastroRepository } from "./prisma-veiculo-cadastro.repository";

export class PrismaCadastroRepository implements CadastroRepository {
  private readonly clientes: PrismaClienteCadastroRepository;
  private readonly veiculos: PrismaVeiculoCadastroRepository;

  constructor(prisma: PrismaClient) {
    this.clientes = new PrismaClienteCadastroRepository(prisma);
    this.veiculos = new PrismaVeiculoCadastroRepository(prisma);
  }

  criarCliente(input: CriarClienteInput): Promise<ClienteDto> {
    return this.clientes.criarCliente(input);
  }

  listarClientes(): Promise<ClienteDto[]> {
    return this.clientes.listarClientes();
  }

  buscarClientePorId(id: string): Promise<ClienteComVeiculosDto> {
    return this.clientes.buscarClientePorId(id);
  }

  buscarClientePorCpfCnpj(cpfCnpj: string): Promise<ClienteDto> {
    return this.clientes.buscarClientePorCpfCnpj(cpfCnpj);
  }

  atualizarCliente(cpfCnpj: string, input: AtualizarClienteInput): Promise<ClienteDto> {
    return this.clientes.atualizarCliente(cpfCnpj, input);
  }

  removerCliente(cpfCnpj: string): Promise<RemocaoResultado> {
    return this.clientes.removerCliente(cpfCnpj);
  }

  criarVeiculo(input: CriarVeiculoInput): Promise<VeiculoComClientesDto> {
    return this.veiculos.criarVeiculo(input);
  }

  listarVeiculos(): Promise<VeiculoComClientesDto[]> {
    return this.veiculos.listarVeiculos();
  }

  atualizarVeiculo(placa: string, input: AtualizarVeiculoInput): Promise<VeiculoComClientesDto> {
    return this.veiculos.atualizarVeiculo(placa, input);
  }

  removerVeiculo(placa: string): Promise<RemocaoResultado> {
    return this.veiculos.removerVeiculo(placa);
  }
}
