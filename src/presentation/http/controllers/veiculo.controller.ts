import {
  AtualizarVeiculoUseCase,
  CriarVeiculoUseCase,
  ListarVeiculosUseCase,
  RemoverVeiculoUseCase
} from "../../../contexts/cadastro/application/cadastro.use-cases";
import { AtualizarVeiculoInput, CriarVeiculoInput } from "../../../contexts/cadastro/application/cadastro.repository";

export class VeiculoController {
  constructor(
    private readonly criarVeiculoUseCase: CriarVeiculoUseCase,
    private readonly listarVeiculosUseCase: ListarVeiculosUseCase,
    private readonly atualizarVeiculoUseCase: AtualizarVeiculoUseCase,
    private readonly removerVeiculoUseCase: RemoverVeiculoUseCase
  ) {}

  criarVeiculo(input: CriarVeiculoInput) {
    return this.criarVeiculoUseCase.execute(input);
  }

  listarVeiculos() {
    return this.listarVeiculosUseCase.execute();
  }

  atualizarVeiculo(placa: string, input: AtualizarVeiculoInput) {
    return this.atualizarVeiculoUseCase.execute(placa, input);
  }

  removerVeiculo(placa: string) {
    return this.removerVeiculoUseCase.execute(placa);
  }
}
