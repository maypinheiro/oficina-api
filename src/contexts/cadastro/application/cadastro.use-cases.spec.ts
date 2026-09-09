import {
  AtualizarClienteUseCase,
  AtualizarVeiculoUseCase,
  BuscarClientePorCpfCnpjUseCase,
  BuscarClientePorIdUseCase,
  CriarClienteUseCase,
  CriarVeiculoUseCase,
  ListarClientesUseCase,
  ListarVeiculosUseCase,
  RemoverClienteUseCase,
  RemoverVeiculoUseCase
} from "./cadastro.use-cases";
import { ClienteCadastroPort, VeiculoCadastroPort } from "./cadastro.repository";

describe("Cadastro use cases", () => {
  const clientes: jest.Mocked<ClienteCadastroPort> = {
    criarCliente: jest.fn(),
    listarClientes: jest.fn(),
    buscarClientePorId: jest.fn(),
    buscarClientePorCpfCnpj: jest.fn(),
    atualizarCliente: jest.fn(),
    removerCliente: jest.fn()
  };
  const veiculos: jest.Mocked<VeiculoCadastroPort> = {
    criarVeiculo: jest.fn(),
    listarVeiculos: jest.fn(),
    atualizarVeiculo: jest.fn(),
    removerVeiculo: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it("delegam operacoes para o repositorio", async () => {
    await new CriarClienteUseCase(clientes).execute({
      nome: "Cliente",
      cpfCnpj: "52998224725",
      email: "cliente@email.com",
      telefone: "11999999999"
    });
    await new ListarClientesUseCase(clientes).execute();
    await new BuscarClientePorIdUseCase(clientes).execute("cliente-1");
    await new BuscarClientePorCpfCnpjUseCase(clientes).execute("52998224725");
    await new AtualizarClienteUseCase(clientes).execute("52998224725", { nome: "Cliente Atualizado" });
    await new RemoverClienteUseCase(clientes).execute("52998224725");
    await new CriarVeiculoUseCase(veiculos).execute({
      placa: "ABC1D23",
      marca: "Fiat",
      modelo: "Uno",
      ano: 2020,
      cpfCnpj: "52998224725"
    });
    await new ListarVeiculosUseCase(veiculos).execute();
    await new AtualizarVeiculoUseCase(veiculos).execute("ABC1D23", { modelo: "Argo" });
    await new RemoverVeiculoUseCase(veiculos).execute("ABC1D23");

    expect(clientes.criarCliente).toHaveBeenCalledTimes(1);
    expect(clientes.listarClientes).toHaveBeenCalledTimes(1);
    expect(clientes.buscarClientePorId).toHaveBeenCalledWith("cliente-1");
    expect(clientes.buscarClientePorCpfCnpj).toHaveBeenCalledWith("52998224725");
    expect(clientes.atualizarCliente).toHaveBeenCalledWith("52998224725", { nome: "Cliente Atualizado" });
    expect(clientes.removerCliente).toHaveBeenCalledWith("52998224725");
    expect(veiculos.criarVeiculo).toHaveBeenCalledTimes(1);
    expect(veiculos.listarVeiculos).toHaveBeenCalledTimes(1);
    expect(veiculos.atualizarVeiculo).toHaveBeenCalledWith("ABC1D23", { modelo: "Argo" });
    expect(veiculos.removerVeiculo).toHaveBeenCalledWith("ABC1D23");
  });
});
