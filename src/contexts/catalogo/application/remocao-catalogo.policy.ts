import { ApplicationError } from "../../../shared/application/application-error";

export function validarRemocaoServico(totalOrcamentos: number): void {
  if (totalOrcamentos > 0) {
    throw new ApplicationError(409, "Servico possui orcamentos e nao pode ser removido");
  }
}

export function validarRemocaoPeca(totalOrcamentos: number): void {
  if (totalOrcamentos > 0) {
    throw new ApplicationError(409, "Peca possui orcamentos e nao pode ser removida");
  }
}
