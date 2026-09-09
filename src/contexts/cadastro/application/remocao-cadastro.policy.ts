import { ApplicationError } from "../../../shared/application/application-error";

export function validarRemocaoCliente(totalOrdensServico: number): void {
  if (totalOrdensServico > 0) {
    throw new ApplicationError(409, "Cliente possui ordens de servico e nao pode ser removido");
  }
}

export function validarRemocaoVeiculo(totalOrdensServico: number): void {
  if (totalOrdensServico > 0) {
    throw new ApplicationError(409, "Veiculo possui ordens de servico e nao pode ser removido");
  }
}
