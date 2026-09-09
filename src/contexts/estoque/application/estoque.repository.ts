export type EstoqueAtualizado = {
  pecaId: string;
  quantidadeDisponivel: number;
  quantidadeReservada: number;
  atualizadoEm: Date;
};

export type OrdemComReservasLiberadas = {
  numeroOs: string;
  status: string;
  orcamento: {
    status: string;
    pecas: Array<{
      pecaId: string;
      quantidade: number;
    }>;
  } | null;
} | null;

export type ReservarPecaPort = {
  reservarPeca(nome: string, quantidade: number): Promise<EstoqueAtualizado>;
};

export type LiberarPecaReservadaPort = {
  liberarPecaReservada(nome: string, quantidade: number): Promise<EstoqueAtualizado>;
};

export type LiberarReservasDaOsPort = {
  liberarReservasDaOs(numeroOs: string): Promise<OrdemComReservasLiberadas>;
};

export type ConsumirPecaPort = {
  consumirPeca(nome: string, quantidade: number): Promise<EstoqueAtualizado>;
};

export type EstoqueRepository = ReservarPecaPort & LiberarPecaReservadaPort & LiberarReservasDaOsPort & ConsumirPecaPort;
