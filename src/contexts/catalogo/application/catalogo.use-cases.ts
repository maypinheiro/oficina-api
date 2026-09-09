import {
  AtualizarEstoquePort,
  AtualizarPecaInput,
  AtualizarPecaPort,
  AtualizarServicoInput,
  AtualizarServicoPort,
  ConsultarEstoquePort,
  CriarPecaInput,
  CriarPecaPort,
  CriarServicoInput,
  CriarServicoPort,
  ListarEstoquePort,
  ListarPecasPort,
  ListarServicosPort,
  PecaComEstoqueDto,
  RemocaoResultado,
  RemoverPecaPort,
  RemoverServicoPort,
  ServicoComMetricasDto,
  ServicoDto
} from "./catalogo.repository";

export class CriarServicoUseCase {
  constructor(private readonly servicos: CriarServicoPort) {}
  execute(input: CriarServicoInput): Promise<ServicoDto> {
    return this.servicos.criarServico(input);
  }
}

export class ListarServicosUseCase {
  constructor(private readonly servicos: ListarServicosPort) {}
  execute(): Promise<ServicoComMetricasDto[]> {
    return this.servicos.listarServicos();
  }
}

export class AtualizarServicoUseCase {
  constructor(private readonly servicos: AtualizarServicoPort) {}
  execute(nome: string, input: AtualizarServicoInput): Promise<ServicoDto> {
    return this.servicos.atualizarServico(nome, input);
  }
}

export class RemoverServicoUseCase {
  constructor(private readonly servicos: RemoverServicoPort) {}
  execute(nome: string): Promise<RemocaoResultado> {
    return this.servicos.removerServico(nome);
  }
}

export class CriarPecaUseCase {
  constructor(private readonly pecas: CriarPecaPort) {}
  execute(input: CriarPecaInput): Promise<PecaComEstoqueDto> {
    return this.pecas.criarPeca(input);
  }
}

export class ListarPecasUseCase {
  constructor(private readonly pecas: ListarPecasPort) {}
  execute(): Promise<PecaComEstoqueDto[]> {
    return this.pecas.listarPecas();
  }
}

export class AtualizarPecaUseCase {
  constructor(private readonly pecas: AtualizarPecaPort) {}
  execute(nome: string, input: AtualizarPecaInput): Promise<PecaComEstoqueDto> {
    return this.pecas.atualizarPeca(nome, input);
  }
}

export class RemoverPecaUseCase {
  constructor(private readonly pecas: RemoverPecaPort) {}
  execute(nome: string): Promise<RemocaoResultado> {
    return this.pecas.removerPeca(nome);
  }
}

export class ListarEstoqueUseCase {
  constructor(private readonly estoque: ListarEstoquePort) {}
  execute(apenasBaixo?: boolean): Promise<PecaComEstoqueDto[]> {
    return this.estoque.listarEstoque(apenasBaixo);
  }
}

export class ConsultarEstoqueUseCase {
  constructor(private readonly estoque: ConsultarEstoquePort) {}
  execute(nome: string): Promise<PecaComEstoqueDto> {
    return this.estoque.consultarEstoque(nome);
  }
}

export class AtualizarEstoqueUseCase {
  constructor(private readonly estoque: AtualizarEstoquePort) {}
  execute(nome: string, quantidadeDisponivel: number): Promise<PecaComEstoqueDto> {
    return this.estoque.atualizarEstoque(nome, quantidadeDisponivel);
  }
}
