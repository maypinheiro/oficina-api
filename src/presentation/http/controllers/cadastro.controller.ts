import {
  AtualizarClienteUseCase,
  BuscarClientePorCpfCnpjUseCase,
  BuscarClientePorIdUseCase,
  CriarClienteUseCase,
  ListarClientesUseCase,
  RemoverClienteUseCase
} from "../../../contexts/cadastro/application/cadastro.use-cases";
import { AtualizarClienteInput, CriarClienteInput } from "../../../contexts/cadastro/application/cadastro.repository";

export class CadastroController {
  constructor(
    private readonly criarClienteUseCase: CriarClienteUseCase,
    private readonly listarClientesUseCase: ListarClientesUseCase,
    private readonly buscarClientePorCpfCnpjUseCase: BuscarClientePorCpfCnpjUseCase,
    private readonly buscarClientePorIdUseCase: BuscarClientePorIdUseCase,
    private readonly atualizarClienteUseCase: AtualizarClienteUseCase,
    private readonly removerClienteUseCase: RemoverClienteUseCase
  ) {}

  criarCliente(input: CriarClienteInput) {
    return this.criarClienteUseCase.execute(input);
  }

  listarClientes() {
    return this.listarClientesUseCase.execute();
  }

  buscarClientePorCpfCnpj(valor: string) {
    return this.buscarClientePorCpfCnpjUseCase.execute(valor);
  }

  buscarClientePorId(id: string) {
    return this.buscarClientePorIdUseCase.execute(id);
  }

  atualizarCliente(valor: string, input: AtualizarClienteInput) {
    return this.atualizarClienteUseCase.execute(valor, input);
  }

  removerCliente(valor: string) {
    return this.removerClienteUseCase.execute(valor);
  }
}
