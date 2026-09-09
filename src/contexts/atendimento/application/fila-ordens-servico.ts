import { StatusOrdemServicoApp } from "./status-ordem-servico-app";

export const statusOcultosDaFilaOperacional = [StatusOrdemServicoApp.Finalizada, StatusOrdemServicoApp.Entregue] as const;

const prioridadeStatusFila = new Map<string, number>(
  [
    StatusOrdemServicoApp.EmExecucao,
    StatusOrdemServicoApp.AguardandoAprovacao,
    StatusOrdemServicoApp.EmDiagnostico,
    StatusOrdemServicoApp.Recebida
  ].map((status, index) => [status, index])
);

export type ItemFilaOperacional = {
  status: string;
  dataCriacao: Date;
};

export function ordenarFilaOperacional<T extends ItemFilaOperacional>(ordens: T[]): T[] {
  return [...ordens].sort((ordemA, ordemB) => {
    const prioridadeA = prioridadeStatusFila.get(ordemA.status) ?? prioridadeStatusFila.size;
    const prioridadeB = prioridadeStatusFila.get(ordemB.status) ?? prioridadeStatusFila.size;

    if (prioridadeA !== prioridadeB) {
      return prioridadeA - prioridadeB;
    }

    return ordemA.dataCriacao.getTime() - ordemB.dataCriacao.getTime();
  });
}
