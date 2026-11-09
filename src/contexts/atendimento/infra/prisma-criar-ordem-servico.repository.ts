import { Prisma, PrismaClient } from "@prisma/client";

import { prepararItensOrcamentoComReserva } from "../../orcamento/infra/prisma-itens-orcamento";
import { gerarNumeroOs } from "../application/numero-os";
import {
  CriarOrdemServicoInput,
  CriarOrdemServicoPort,
  OrdemServicoComOrcamentoInicial,
  OrdemServicoCriada
} from "../application/ordem-servico.repository";
import {
  montarCriacaoOrcamentoInicial,
  montarCriacaoOrdemComOrcamentoInicial,
  montarCriacaoOrdemRecebida
} from "./prisma-ordem-servico.builders";
import { buscarClienteEVeiculoDaOrdem } from "./prisma-ordem-servico-consultas";

export class PrismaCriarOrdemServicoRepository implements CriarOrdemServicoPort {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly startSaga?: (tx: Prisma.TransactionClient, orderId: string, input: CriarOrdemServicoInput) => Promise<void>
  ) {}

  async criar(input: CriarOrdemServicoInput): Promise<OrdemServicoCriada> {
    return this.prisma.$transaction(async (tx) => {
      const { cliente, veiculo } = await buscarClienteEVeiculoDaOrdem(tx, input);
      const order = await tx.ordemDeServico.create({
        data: montarCriacaoOrdemRecebida(input, cliente.id, veiculo.id, gerarNumeroOs()),
        include: { historico: true }
      });
      await this.startSaga?.(tx, order.id, input);
      return order;
    });
  }

  criarComOrcamentoInicial(input: CriarOrdemServicoInput): Promise<OrdemServicoComOrcamentoInicial> {
    const numeroOs = gerarNumeroOs();
    const servicosSolicitados = input.servicos ?? [];
    const pecasSolicitadas = input.pecas ?? [];

    return this.prisma.$transaction(async (tx) => {
      const { cliente, veiculo } = await buscarClienteEVeiculoDaOrdem(tx, input);

      const itens = await prepararItensOrcamentoComReserva(tx, {
        servicos: servicosSolicitados,
        pecas: pecasSolicitadas
      });

      const ordem = await tx.ordemDeServico.create({
        data: montarCriacaoOrdemComOrcamentoInicial(input, cliente.id, veiculo.id, numeroOs)
      });

      const orcamento = await tx.orcamento.create({
        data: montarCriacaoOrcamentoInicial(ordem.id, itens),
        include: { servicos: true, pecas: true }
      });

      await this.startSaga?.(tx, ordem.id, input);

      return {
        ordemServico: { numeroOs: ordem.numeroOs },
        orcamento
      };
    });
  }
}
