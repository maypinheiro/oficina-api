export type CriarServicoInput = {
  nome: string;
  preco: number;
};

export type AtualizarServicoInput = Partial<CriarServicoInput>;

export type CriarPecaInput = {
  nome: string;
  preco: number;
  quantidade: number;
  estoqueMinimo?: number;
};

export type AtualizarPecaInput = Partial<CriarPecaInput>;

export type ValorMonetario = number | { toString(): string };

export type ServicoDto = {
  id: string;
  nome: string;
  preco: ValorMonetario;
};

export type ServicoComMetricasDto = ServicoDto & {
  execucoesConsideradas: number;
  tempoMedioExecucaoMs: number | null;
  tempoMedioExecucaoHoras: number | null;
  mensagemTempoMedio: string;
};

export type EstoquePecaDto = {
  quantidadeDisponivel: number;
  quantidadeReservada: number;
};

export type PecaComEstoqueDto = {
  id: string;
  nome: string;
  preco: ValorMonetario;
  quantidade: number;
  estoqueMinimo: number;
  estoque: EstoquePecaDto | null;
  criadoEm: Date;
  atualizadoEm: Date;
  estoqueBaixo: boolean;
  alertaEstoque: string;
};

export type RemocaoResultado = {
  message: string;
};

export type CriarServicoPort = {
  criarServico(input: CriarServicoInput): Promise<ServicoDto>;
};

export type ListarServicosPort = {
  listarServicos(): Promise<ServicoComMetricasDto[]>;
};

export type AtualizarServicoPort = {
  atualizarServico(nome: string, input: AtualizarServicoInput): Promise<ServicoDto>;
};

export type RemoverServicoPort = {
  removerServico(nome: string): Promise<RemocaoResultado>;
};

export type ServicoCatalogoPort = CriarServicoPort & ListarServicosPort & AtualizarServicoPort & RemoverServicoPort;

export type CriarPecaPort = {
  criarPeca(input: CriarPecaInput): Promise<PecaComEstoqueDto>;
};

export type ListarPecasPort = {
  listarPecas(): Promise<PecaComEstoqueDto[]>;
};

export type AtualizarPecaPort = {
  atualizarPeca(nome: string, input: AtualizarPecaInput): Promise<PecaComEstoqueDto>;
};

export type RemoverPecaPort = {
  removerPeca(nome: string): Promise<RemocaoResultado>;
};

export type PecaCatalogoPort = CriarPecaPort & ListarPecasPort & AtualizarPecaPort & RemoverPecaPort;

export type ListarEstoquePort = {
  listarEstoque(apenasBaixo?: boolean): Promise<PecaComEstoqueDto[]>;
};

export type ConsultarEstoquePort = {
  consultarEstoque(nome: string): Promise<PecaComEstoqueDto>;
};

export type AtualizarEstoquePort = {
  atualizarEstoque(nome: string, quantidadeDisponivel: number): Promise<PecaComEstoqueDto>;
};

export type EstoqueCatalogoPort = ListarEstoquePort & ConsultarEstoquePort & AtualizarEstoquePort;

export type CatalogoRepository = ServicoCatalogoPort & PecaCatalogoPort & EstoqueCatalogoPort;
