import { ApplicationError } from "../../../shared/application/application-error";
import { StatusOrdemServicoApp } from "../../atendimento/application/status-ordem-servico-app";
import { StatusOrcamentoApp } from "./status-orcamento-app";

export function validarCriacaoOrcamento(statusOrdem: string, jaPossuiOrcamento: boolean): void {
  if (statusOrdem !== StatusOrdemServicoApp.AguardandoAprovacao) {
    throw new ApplicationError(422, "Orcamento somente apos diagnostico tecnico");
  }

  if (jaPossuiOrcamento) {
    throw new ApplicationError(409, "Ordem de servico ja possui orcamento");
  }
}

export function validarAprovacaoOrcamento(statusOrcamento: string): void {
  if (statusOrcamento !== StatusOrcamentoApp.Pendente) {
    throw new ApplicationError(422, "Somente orcamento pendente pode ser aprovado");
  }
}

export function validarRejeicaoOrcamento(statusOrcamento: string): void {
  if (statusOrcamento !== StatusOrcamentoApp.Pendente) {
    throw new ApplicationError(422, "Somente orcamento pendente pode ser rejeitado");
  }
}
