import { ApplicationError } from "../../../shared/application/application-error";
import { StatusOrcamentoApp } from "../../orcamento/application/status-orcamento-app";
import { StatusOrdemServicoApp } from "./status-ordem-servico-app";

export function validarInicioDiagnostico(status: string): void {
  if (status !== StatusOrdemServicoApp.Recebida) {
    throw new ApplicationError(422, "Diagnostico so pode iniciar com OS recebida");
  }
}

export function validarRegistroProblema(status: string): void {
  if (status !== StatusOrdemServicoApp.EmDiagnostico) {
    throw new ApplicationError(422, "Problema tecnico deve ser registrado durante diagnostico");
  }
}

export function validarInicioExecucao(statusOrdem: string, statusOrcamento?: string): void {
  if (statusOrdem !== StatusOrdemServicoApp.Aprovada || statusOrcamento !== StatusOrcamentoApp.Aprovado) {
    throw new ApplicationError(422, "Execucao somente apos aprovacao do orcamento");
  }
}

export function validarFinalizacao(status: string): void {
  if (status !== StatusOrdemServicoApp.EmExecucao) {
    throw new ApplicationError(422, "Servico deve estar em execucao para finalizar");
  }
}

export function validarEntrega(status: string): void {
  if (status !== StatusOrdemServicoApp.Finalizada) {
    throw new ApplicationError(422, "Veiculo somente pode ser entregue apos finalizacao");
  }
}
