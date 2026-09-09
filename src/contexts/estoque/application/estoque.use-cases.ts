import {
  ConsumirPecaPort,
  EstoqueAtualizado,
  LiberarPecaReservadaPort,
  LiberarReservasDaOsPort,
  OrdemComReservasLiberadas,
  ReservarPecaPort
} from "./estoque.repository";

export class ReservarPecaUseCase {
  constructor(private readonly estoque: ReservarPecaPort) {}
  execute(nome: string, quantidade: number): Promise<EstoqueAtualizado> {
    return this.estoque.reservarPeca(nome, quantidade);
  }
}

export class LiberarPecaReservadaUseCase {
  constructor(private readonly estoque: LiberarPecaReservadaPort) {}
  execute(nome: string, quantidade: number): Promise<EstoqueAtualizado> {
    return this.estoque.liberarPecaReservada(nome, quantidade);
  }
}

export class LiberarReservasDaOsUseCase {
  constructor(private readonly estoque: LiberarReservasDaOsPort) {}
  execute(numeroOs: string): Promise<OrdemComReservasLiberadas> {
    return this.estoque.liberarReservasDaOs(numeroOs);
  }
}

export class ConsumirPecaUseCase {
  constructor(private readonly estoque: ConsumirPecaPort) {}
  execute(nome: string, quantidade: number): Promise<EstoqueAtualizado> {
    return this.estoque.consumirPeca(nome, quantidade);
  }
}
