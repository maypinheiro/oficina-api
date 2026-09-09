import { DomainError } from "../../../shared/domain/domain-error";
import { Entity } from "../../../shared/domain/entity";
import { StatusOrcamento } from "./status-orcamento";

type OrcamentoProps = {
  ordemServicoId: string;
  valorTotal: number;
  status: StatusOrcamento;
};

export class Orcamento extends Entity<OrcamentoProps> {
  private constructor(id: string, props: OrcamentoProps) {
    super(id, props);
  }

  public static create(id: string, props: Omit<OrcamentoProps, "status">): Orcamento {
    if (props.valorTotal < 0) {
      throw new DomainError("Valor do orcamento nao pode ser negativo");
    }

    return new Orcamento(id, {
      ...props,
      status: StatusOrcamento.Pendente
    });
  }

  public aprovar(): void {
    if (this.props.status !== StatusOrcamento.Pendente) {
      throw new DomainError("Somente orcamento pendente pode ser aprovado");
    }

    this.props.status = StatusOrcamento.Aprovado;
  }

  public rejeitar(): void {
    if (this.props.status !== StatusOrcamento.Pendente) {
      throw new DomainError("Somente orcamento pendente pode ser rejeitado");
    }

    this.props.status = StatusOrcamento.Rejeitado;
  }

  public get status(): StatusOrcamento {
    return this.props.status;
  }
}

