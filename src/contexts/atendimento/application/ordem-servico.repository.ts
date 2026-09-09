export type CriarOrdemServicoInput = {
  cpfCnpj: string;
  placa: string;
  descricaoProblemaCliente: string;
  servicos?: string[];
  pecas?: PecaSolicitadaInput[];
};

export type PecaSolicitadaInput = {
  nome: string;
  quantidade: number;
};

export type OrdemServicoCriada = {
  numeroOs: string;
};

export type OrcamentoInicialCriado = {
  id: string;
  ordemServicoId: string;
  valorTotal: number | { toString(): string };
  status: string;
  servicos: Array<{
    id: string;
    orcamentoId: string;
    servicoId: string;
    valor: number | { toString(): string };
  }>;
  pecas: Array<{
    id: string;
    orcamentoId: string;
    pecaId: string;
    quantidade: number;
    valorUnitario: number | { toString(): string };
  }>;
};

export type OrdemServicoComOrcamentoInicial = {
  ordemServico: OrdemServicoCriada;
  orcamento: OrcamentoInicialCriado;
};

export type ListarOrdensServicoFiltros = {
  status?: string;
  page?: number;
  pageSize?: number;
};

export type ResultadoPaginado<T> = {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type OrdemServicoResumo = {
  numeroOs: string;
  status: string;
  dataCriacao: Date;
};

export type ClienteOrdemServico = {
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
};

export type VeiculoOrdemServico = {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
};

export type OrcamentoOrdemServico = {
  status: string;
  valorTotal: number;
  servicos: Array<{
    nome: string;
    valor: number;
  }>;
  pecas: Array<{
    nome: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
};

export type HistoricoStatusOrdemServico = {
  status: string;
  dataHora: Date;
};

export type OrdemServicoDetalhada = {
  numeroOs: string;
  status: string;
  descricaoProblemaCliente: string;
  problemaIdentificado: string | null;
  dataCriacao: Date;
  dataFinalizacao: Date | null;
  cliente: ClienteOrdemServico;
  veiculo: VeiculoOrdemServico;
  orcamento: OrcamentoOrdemServico | null;
  historico: HistoricoStatusOrdemServico[];
};

export type StatusOrdemServicoConsulta = {
  numeroOs: string;
  statusAtual: string;
  dataCriacao: Date;
  ultimaAtualizacaoStatus: Date;
};

export type OrdemServicoStatusAtualizada = {
  id: string;
  numeroOs: string;
  status: string;
  problemaIdentificado: string | null;
  dataFinalizacao: Date | null;
  historico: HistoricoStatusOrdemServico[];
};

export type CriarOrdemServicoPort = {
  criar(input: CriarOrdemServicoInput): Promise<OrdemServicoCriada>;
  criarComOrcamentoInicial(input: CriarOrdemServicoInput): Promise<OrdemServicoComOrcamentoInicial>;
};

export type ListarOrdensServicoPort = {
  listar(filtros?: ListarOrdensServicoFiltros): Promise<ResultadoPaginado<OrdemServicoResumo>>;
};

export type BuscarOrdemServicoPort = {
  buscarPorNumero(numeroOs: string): Promise<OrdemServicoDetalhada>;
};

export type ConsultarStatusOrdemServicoPort = {
  consultarStatus(numeroOs: string): Promise<StatusOrdemServicoConsulta>;
};

export type ListarHistoricoOrdemServicoPort = {
  listarHistorico(numeroOs: string): Promise<HistoricoStatusOrdemServico[]>;
};

export type IniciarDiagnosticoPort = {
  iniciarDiagnostico(numeroOs: string): Promise<OrdemServicoStatusAtualizada>;
};

export type RegistrarProblemaPort = {
  registrarProblema(numeroOs: string, problemaIdentificado: string): Promise<OrdemServicoStatusAtualizada>;
};

export type IniciarExecucaoPort = {
  iniciarExecucao(numeroOs: string): Promise<OrdemServicoStatusAtualizada>;
};

export type FinalizarServicoPort = {
  finalizar(numeroOs: string): Promise<OrdemServicoStatusAtualizada>;
};

export type EntregarVeiculoPort = {
  entregar(numeroOs: string): Promise<OrdemServicoStatusAtualizada>;
};

export type AtualizarStatusOrdemServicoPort = IniciarDiagnosticoPort &
  RegistrarProblemaPort &
  IniciarExecucaoPort &
  FinalizarServicoPort &
  EntregarVeiculoPort;

export type OrdemServicoRepository = CriarOrdemServicoPort &
  ListarOrdensServicoPort &
  BuscarOrdemServicoPort &
  ConsultarStatusOrdemServicoPort &
  ListarHistoricoOrdemServicoPort &
  AtualizarStatusOrdemServicoPort;
