import { DomainError } from "../../../shared/domain/domain-error";
import { Entity } from "../../../shared/domain/entity";

type EstoqueProps = {
  pecaId: string;
  quantidadeDisponivel: number;
  quantidadeReservada: number;
};

export class Estoque extends Entity<EstoqueProps> {
  private constructor(id: string, props: EstoqueProps) {
    super(id, props);
  }

  public static create(id: string, props: EstoqueProps): Estoque {
    if (props.quantidadeDisponivel < 0 || props.quantidadeReservada < 0) {
      throw new DomainError("Quantidade de estoque nao pode ser negativa");
    }

    return new Estoque(id, props);
  }

  public reservar(quantidade: number): void {
    if (quantidade <= 0) {
      throw new DomainError("Quantidade para reserva deve ser positiva");
    }

    if (this.props.quantidadeDisponivel < quantidade) {
      throw new DomainError("Estoque insuficiente para reserva");
    }

    this.props.quantidadeDisponivel -= quantidade;
    this.props.quantidadeReservada += quantidade;
  }

  public liberarReserva(quantidade: number): void {
    if (quantidade <= 0) {
      throw new DomainError("Quantidade para liberacao deve ser positiva");
    }

    if (this.props.quantidadeReservada < quantidade) {
      throw new DomainError("Reserva insuficiente para liberacao");
    }

    this.props.quantidadeReservada -= quantidade;
    this.props.quantidadeDisponivel += quantidade;
  }

  public consumirReserva(quantidade: number): void {
    if (quantidade <= 0) {
      throw new DomainError("Quantidade para consumo deve ser positiva");
    }

    if (this.props.quantidadeReservada < quantidade) {
      throw new DomainError("Reserva insuficiente para consumo");
    }

    this.props.quantidadeReservada -= quantidade;
  }

  public get quantidadeDisponivel(): number {
    return this.props.quantidadeDisponivel;
  }

  public get quantidadeReservada(): number {
    return this.props.quantidadeReservada;
  }
}

