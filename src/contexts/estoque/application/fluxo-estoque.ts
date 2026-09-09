import { ApplicationError } from "../../../shared/application/application-error";
import { StatusOrdemServicoApp } from "../../atendimento/application/status-ordem-servico-app";
import { StatusOrcamentoApp } from "../../orcamento/application/status-orcamento-app";

export function validarLiberacaoReservasDaOs(statusOrdem: string, statusOrcamento: string): void {
  if (statusOrdem !== StatusOrdemServicoApp.OrcamentoRejeitado || statusOrcamento !== StatusOrcamentoApp.Rejeitado) {
    throw new ApplicationError(422, "Reservas so podem ser liberadas apos rejeicao do orcamento");
  }
}
