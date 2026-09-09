import { Peca, Prisma } from "@prisma/client";

import { calcularMetricasExecucaoServicos } from "../../../shared/application/metricas-servicos";
import { PecaComEstoqueDto, ServicoComMetricasDto, ServicoDto } from "../application/catalogo.repository";

type PecaComEstoquePrisma = Peca & {
  estoque: {
    quantidadeDisponivel: number;
    quantidadeReservada: number;
  } | null;
};

type ServicoComOrcamentosPrisma = ServicoDto & {
  orcamentos: Array<{
    orcamento: {
      ordemServico: {
        historico: Array<{
          status: string;
          dataHora: Date;
        }>;
      };
    };
  }>;
};

export const servicosComHistoricoInclude = {
  orcamentos: {
    include: {
      orcamento: {
        include: {
          ordemServico: {
            include: { historico: { orderBy: { dataHora: "asc" } } }
          }
        }
      }
    }
  }
} satisfies Prisma.ServicoInclude;

export const pecaComEstoqueInclude = {
  estoque: true
} satisfies Prisma.PecaInclude;

export function mapPecaComAlertaEstoque(peca: PecaComEstoquePrisma): PecaComEstoqueDto {
  const quantidadeDisponivel = peca.estoque?.quantidadeDisponivel ?? 0;
  const estoqueBaixo = quantidadeDisponivel <= peca.estoqueMinimo;

  return {
    ...peca,
    estoqueBaixo,
    alertaEstoque: estoqueBaixo
      ? `Estoque baixo para ${peca.nome}: ${quantidadeDisponivel} disponivel(is), minimo ${peca.estoqueMinimo}.`
      : "Estoque em nivel adequado."
  };
}

export function mapServicosComMetricas(servicos: ServicoComOrcamentosPrisma[]): ServicoComMetricasDto[] {
  const metricas = calcularMetricasExecucaoServicos(servicos);

  return servicos.map((servico) => {
    const metrica = metricas.get(servico.nome);

    return {
      id: servico.id,
      nome: servico.nome,
      preco: servico.preco,
      execucoesConsideradas: metrica?.execucoesConsideradas ?? 0,
      tempoMedioExecucaoMs: metrica?.tempoMedioExecucaoMs ?? null,
      tempoMedioExecucaoHoras: metrica?.tempoMedioExecucaoHoras ?? null,
      mensagemTempoMedio: metrica?.mensagemTempoMedio ?? "Servico ainda nao possui execucoes finalizadas para calculo do tempo medio."
    };
  });
}
