import { PrismaClient } from "@prisma/client";

import {
  buscarServicoUnicoPorNome
} from "../../../shared/infra/prisma-catalogo-consultas";
import {
  AtualizarServicoInput,
  AtualizarServicoPort,
  CriarServicoInput,
  CriarServicoPort,
  ListarServicosPort,
  RemocaoResultado,
  RemoverServicoPort,
  ServicoComMetricasDto,
  ServicoDto
} from "../application/catalogo.repository";
import { validarRemocaoServico } from "../application/remocao-catalogo.policy";
import { mapServicosComMetricas, servicosComHistoricoInclude } from "./prisma-catalogo.mapper";

export class PrismaServicoCatalogoRepository
  implements CriarServicoPort, ListarServicosPort, AtualizarServicoPort, RemoverServicoPort
{
  constructor(private readonly prisma: PrismaClient) {}

  criarServico(input: CriarServicoInput): Promise<ServicoDto> {
    return this.prisma.servico.create({ data: input });
  }

  async listarServicos(): Promise<ServicoComMetricasDto[]> {
    const servicos = await this.prisma.servico.findMany({
      include: servicosComHistoricoInclude,
      orderBy: { nome: "asc" }
    });

    return mapServicosComMetricas(servicos);
  }

  async atualizarServico(nome: string, input: AtualizarServicoInput): Promise<ServicoDto> {
    const servico = await buscarServicoUnicoPorNome(this.prisma, nome);

    return this.prisma.servico.update({
      where: { id: servico.id },
      data: {
        ...(input.nome !== undefined ? { nome: input.nome } : {}),
        ...(input.preco !== undefined ? { preco: input.preco } : {})
      }
    });
  }

  async removerServico(nome: string): Promise<RemocaoResultado> {
    const servico = await buscarServicoUnicoPorNome(this.prisma, nome);
    const orcamentos = await this.prisma.orcamentoServico.count({ where: { servicoId: servico.id } });

    validarRemocaoServico(orcamentos);

    await this.prisma.servico.delete({ where: { id: servico.id } });

    return { message: "Servico removido" };
  }
}
