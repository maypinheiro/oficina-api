export type CriarClienteInput = {
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
};

export const statusCliente = ["ATIVO", "INATIVO", "BLOQUEADO"] as const;
export type StatusCliente = (typeof statusCliente)[number];

export type AtualizarClienteInput = Partial<CriarClienteInput> & {
  status?: StatusCliente;
};

export type CriarVeiculoInput = {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cpfCnpj: string;
};

export type AtualizarVeiculoInput = Partial<Pick<CriarVeiculoInput, "placa" | "marca" | "modelo" | "ano">>;

export type ClienteDto = {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  status: StatusCliente;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type VinculoVeiculoClienteDto = {
  id: string;
  clienteId?: string;
  veiculoId?: string;
  criadoEm: Date;
  cliente?: ClienteDto;
  veiculo?: VeiculoDto;
};

export type ClienteComVeiculosDto = ClienteDto & {
  veiculos: VinculoVeiculoClienteDto[];
};

export type VeiculoDto = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type VeiculoComClientesDto = VeiculoDto & {
  clientes: VinculoVeiculoClienteDto[];
};

export type RemocaoResultado = {
  message: string;
};

export type CriarClientePort = {
  criarCliente(input: CriarClienteInput): Promise<ClienteDto>;
};

export type ListarClientesPort = {
  listarClientes(): Promise<ClienteDto[]>;
};

export type BuscarClientePorIdPort = {
  buscarClientePorId(id: string): Promise<ClienteComVeiculosDto>;
};

export type BuscarClientePorCpfCnpjPort = {
  buscarClientePorCpfCnpj(cpfCnpj: string): Promise<ClienteDto>;
};

export type AtualizarClientePort = {
  atualizarCliente(cpfCnpj: string, input: AtualizarClienteInput): Promise<ClienteDto>;
};

export type RemoverClientePort = {
  removerCliente(cpfCnpj: string): Promise<RemocaoResultado>;
};

export type ClienteCadastroPort = CriarClientePort &
  ListarClientesPort &
  BuscarClientePorIdPort &
  BuscarClientePorCpfCnpjPort &
  AtualizarClientePort &
  RemoverClientePort;

export type CriarVeiculoPort = {
  criarVeiculo(input: CriarVeiculoInput): Promise<VeiculoComClientesDto>;
};

export type ListarVeiculosPort = {
  listarVeiculos(): Promise<VeiculoComClientesDto[]>;
};

export type AtualizarVeiculoPort = {
  atualizarVeiculo(placa: string, input: AtualizarVeiculoInput): Promise<VeiculoComClientesDto>;
};

export type RemoverVeiculoPort = {
  removerVeiculo(placa: string): Promise<RemocaoResultado>;
};

export type VeiculoCadastroPort = CriarVeiculoPort & ListarVeiculosPort & AtualizarVeiculoPort & RemoverVeiculoPort;

export type CadastroRepository = ClienteCadastroPort & VeiculoCadastroPort;
