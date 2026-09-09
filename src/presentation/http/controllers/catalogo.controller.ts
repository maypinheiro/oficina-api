import {
  AtualizarEstoqueUseCase,
  AtualizarPecaUseCase,
  AtualizarServicoUseCase,
  CriarPecaUseCase,
  CriarServicoUseCase,
  ListarPecasUseCase,
  ListarServicosUseCase,
  RemoverPecaUseCase,
  RemoverServicoUseCase
} from "../../../contexts/catalogo/application/catalogo.use-cases";
import {
  AtualizarPecaInput,
  AtualizarServicoInput,
  CriarPecaInput,
  CriarServicoInput
} from "../../../contexts/catalogo/application/catalogo.repository";

export class CatalogoController {
  constructor(
    private readonly criarServicoUseCase: CriarServicoUseCase,
    private readonly listarServicosUseCase: ListarServicosUseCase,
    private readonly atualizarServicoUseCase: AtualizarServicoUseCase,
    private readonly removerServicoUseCase: RemoverServicoUseCase,
    private readonly criarPecaUseCase: CriarPecaUseCase,
    private readonly listarPecasUseCase: ListarPecasUseCase,
    private readonly atualizarPecaUseCase: AtualizarPecaUseCase,
    private readonly removerPecaUseCase: RemoverPecaUseCase,
    private readonly atualizarEstoqueUseCase: AtualizarEstoqueUseCase
  ) {}

  criarServico(input: CriarServicoInput) {
    return this.criarServicoUseCase.execute(input);
  }

  listarServicos() {
    return this.listarServicosUseCase.execute();
  }

  atualizarServico(nome: string, input: AtualizarServicoInput) {
    return this.atualizarServicoUseCase.execute(nome, input);
  }

  removerServico(nome: string) {
    return this.removerServicoUseCase.execute(nome);
  }

  criarPeca(input: CriarPecaInput) {
    return this.criarPecaUseCase.execute(input);
  }

  listarPecas() {
    return this.listarPecasUseCase.execute();
  }

  atualizarPeca(nome: string, input: AtualizarPecaInput) {
    return this.atualizarPecaUseCase.execute(nome, input);
  }

  removerPeca(nome: string) {
    return this.removerPecaUseCase.execute(nome);
  }

  atualizarEstoque(nome: string, quantidadeDisponivel: number) {
    return this.atualizarEstoqueUseCase.execute(nome, quantidadeDisponivel);
  }
}
