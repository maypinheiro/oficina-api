import { Entity } from "../../../shared/domain/entity";
import { StatusOrdemServico } from "./status-ordem-servico";

type HistoricoStatusOSProps = {
  ordemServicoId: string;
  status: StatusOrdemServico;
  dataHora: Date;
};

export class HistoricoStatusOS extends Entity<HistoricoStatusOSProps> {
  private constructor(id: string, props: HistoricoStatusOSProps) {
    super(id, props);
  }

  public static create(id: string, props: HistoricoStatusOSProps): HistoricoStatusOS {
    return new HistoricoStatusOS(id, {
      ...props,
      dataHora: new Date(props.dataHora)
    });
  }

  public get status(): StatusOrdemServico {
    return this.props.status;
  }

  public get dataHora(): Date {
    return new Date(this.props.dataHora);
  }
}

