import {
  ConsumirPecaUseCase,
  LiberarPecaReservadaUseCase,
  LiberarReservasDaOsUseCase,
  ReservarPecaUseCase
} from "../../../contexts/estoque/application/estoque.use-cases";
import { AtualizarEstoqueUseCase, ConsultarEstoqueUseCase, ListarEstoqueUseCase } from "../../../contexts/catalogo/application/catalogo.use-cases";

export class EstoqueController {
  constructor(
    private readonly listarEstoqueUseCase: ListarEstoqueUseCase,
    private readonly consultarEstoqueUseCase: ConsultarEstoqueUseCase,
    private readonly atualizarEstoqueUseCase: AtualizarEstoqueUseCase,
    private readonly reservarPecaUseCase: ReservarPecaUseCase,
    private readonly liberarPecaReservadaUseCase: LiberarPecaReservadaUseCase,
    private readonly liberarReservasDaOsUseCase: LiberarReservasDaOsUseCase,
    private readonly consumirPecaUseCase: ConsumirPecaUseCase
  ) {}

  listarEstoque(baixo?: boolean) {
    return this.listarEstoqueUseCase.execute(baixo);
  }

  consultarEstoque(nome: string) {
    return this.consultarEstoqueUseCase.execute(nome);
  }

  atualizarEstoque(nome: string, quantidadeDisponivel: number) {
    return this.atualizarEstoqueUseCase.execute(nome, quantidadeDisponivel);
  }

  reservarPeca(nome: string, quantidade: number) {
    return this.reservarPecaUseCase.execute(nome, quantidade);
  }

  liberarPecaReservada(nome: string, quantidade: number) {
    return this.liberarPecaReservadaUseCase.execute(nome, quantidade);
  }

  liberarReservasDaOs(numeroOs: string) {
    return this.liberarReservasDaOsUseCase.execute(numeroOs);
  }

  consumirPeca(nome: string, quantidade: number) {
    return this.consumirPecaUseCase.execute(nome, quantidade);
  }
}
