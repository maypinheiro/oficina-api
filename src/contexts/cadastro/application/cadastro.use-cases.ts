import {
  AtualizarClienteInput,
  AtualizarClientePort,
  AtualizarVeiculoInput,
  AtualizarVeiculoPort,
  BuscarClientePorCpfCnpjPort,
  BuscarClientePorIdPort,
  ClienteComVeiculosDto,
  ClienteDto,
  CriarClienteInput,
  CriarClientePort,
  CriarVeiculoInput,
  CriarVeiculoPort,
  ListarClientesPort,
  ListarVeiculosPort,
  RemocaoResultado,
  RemoverClientePort,
  RemoverVeiculoPort,
  VeiculoComClientesDto
} from "./cadastro.repository";

export class CriarClienteUseCase {
  constructor(private readonly clientes: CriarClientePort) {}
  execute(input: CriarClienteInput): Promise<ClienteDto> {
    return this.clientes.criarCliente(input);
  }
}

export class ListarClientesUseCase {
  constructor(private readonly clientes: ListarClientesPort) {}
  execute(): Promise<ClienteDto[]> {
    return this.clientes.listarClientes();
  }
}

export class BuscarClientePorIdUseCase {
  constructor(private readonly clientes: BuscarClientePorIdPort) {}
  execute(id: string): Promise<ClienteComVeiculosDto> {
    return this.clientes.buscarClientePorId(id);
  }
}

export class BuscarClientePorCpfCnpjUseCase {
  constructor(private readonly clientes: BuscarClientePorCpfCnpjPort) {}
  execute(cpfCnpj: string): Promise<ClienteDto> {
    return this.clientes.buscarClientePorCpfCnpj(cpfCnpj);
  }
}

export class AtualizarClienteUseCase {
  constructor(private readonly clientes: AtualizarClientePort) {}
  execute(cpfCnpj: string, input: AtualizarClienteInput): Promise<ClienteDto> {
    return this.clientes.atualizarCliente(cpfCnpj, input);
  }
}

export class RemoverClienteUseCase {
  constructor(private readonly clientes: RemoverClientePort) {}
  execute(cpfCnpj: string): Promise<RemocaoResultado> {
    return this.clientes.removerCliente(cpfCnpj);
  }
}

export class CriarVeiculoUseCase {
  constructor(private readonly veiculos: CriarVeiculoPort) {}
  execute(input: CriarVeiculoInput): Promise<VeiculoComClientesDto> {
    return this.veiculos.criarVeiculo(input);
  }
}

export class ListarVeiculosUseCase {
  constructor(private readonly veiculos: ListarVeiculosPort) {}
  execute(): Promise<VeiculoComClientesDto[]> {
    return this.veiculos.listarVeiculos();
  }
}

export class AtualizarVeiculoUseCase {
  constructor(private readonly veiculos: AtualizarVeiculoPort) {}
  execute(placa: string, input: AtualizarVeiculoInput): Promise<VeiculoComClientesDto> {
    return this.veiculos.atualizarVeiculo(placa, input);
  }
}

export class RemoverVeiculoUseCase {
  constructor(private readonly veiculos: RemoverVeiculoPort) {}
  execute(placa: string): Promise<RemocaoResultado> {
    return this.veiculos.removerVeiculo(placa);
  }
}
