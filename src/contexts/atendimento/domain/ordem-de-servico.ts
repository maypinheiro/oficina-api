import { DomainError } from "../../../shared/domain/domain-error";
import { Entity } from "../../../shared/domain/entity";
import { HistoricoStatusOS } from "./historico-status-os";
import { StatusOrdemServico } from "./status-ordem-servico";

type OrdemDeServicoProps = {
  numeroOs: string;
  clienteId: string;
  veiculoId: string;
  descricaoProblemaCliente: string;
  problemaIdentificado?: string;
  status: StatusOrdemServico;
  dataCriacao: Date;
  dataFinalizacao?: Date;
  historico: HistoricoStatusOS[];
};

export class OrdemDeServico extends Entity<OrdemDeServicoProps> {
  private constructor(id: string, props: OrdemDeServicoProps) {
    super(id, props);
  }

  public static create(
    id: string,
    props: Omit<OrdemDeServicoProps, "status" | "dataCriacao" | "historico">
  ): OrdemDeServico {
    const dataCriacao = new Date();

    return new OrdemDeServico(id, {
      ...props,
      status: StatusOrdemServico.Recebida,
      dataCriacao,
      historico: [
        HistoricoStatusOS.create(`${id}-status-inicial`, {
          ordemServicoId: id,
          status: StatusOrdemServico.Recebida,
          dataHora: dataCriacao
        })
      ]
    });
  }

  public iniciarDiagnostico(): void {
    this.alterarStatus(StatusOrdemServico.EmDiagnostico);
  }

  public registrarProblemaTecnico(problemaIdentificado: string): void {
    if (this.props.status !== StatusOrdemServico.EmDiagnostico) {
      throw new DomainError("Diagnostico deve estar em andamento");
    }

    this.props.problemaIdentificado = problemaIdentificado;
    this.alterarStatus(StatusOrdemServico.AguardandoAprovacao);
  }

  public iniciarExecucao(): void {
    if (this.props.status !== StatusOrdemServico.AguardandoAprovacao) {
      throw new DomainError("Execucao somente apos aprovacao do orcamento");
    }

    this.alterarStatus(StatusOrdemServico.EmExecucao);
  }

  public finalizar(): void {
    if (this.props.status !== StatusOrdemServico.EmExecucao) {
      throw new DomainError("Servico deve estar em execucao para finalizar");
    }

    this.props.dataFinalizacao = new Date();
    this.alterarStatus(StatusOrdemServico.Finalizada);
  }

  private alterarStatus(status: StatusOrdemServico): void {
    this.props.status = status;
    this.props.historico.push(
      HistoricoStatusOS.create(`${this.id}-${status}-${this.props.historico.length + 1}`, {
        ordemServicoId: this.id,
        status,
        dataHora: new Date()
      })
    );
  }

  public get status(): StatusOrdemServico {
    return this.props.status;
  }

  public get historico(): readonly HistoricoStatusOS[] {
    return [...this.props.historico];
  }
}

