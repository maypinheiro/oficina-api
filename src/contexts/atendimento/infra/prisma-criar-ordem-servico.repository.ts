import { PrismaClient } from "@prisma/client";

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
  constructor(private readonly prisma: PrismaClient) {}

  async criar(input: CriarOrdemServicoInput): Promise<OrdemServicoCriada> {
    const { cliente, veiculo } = await buscarClienteEVeiculoDaOrdem(this.prisma, input);

    return this.prisma.ordemDeServico.create({
      data: montarCriacaoOrdemRecebida(input, cliente.id, veiculo.id, gerarNumeroOs()),
      include: { historico: true }
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

      return {
        ordemServico: { numeroOs: ordem.numeroOs },
        orcamento
      };
    });
  }
}
