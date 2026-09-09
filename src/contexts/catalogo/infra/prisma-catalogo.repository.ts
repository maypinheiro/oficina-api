import { PrismaClient } from "@prisma/client";

import {
  AtualizarPecaInput,
  AtualizarServicoInput,
  CatalogoRepository,
  CriarPecaInput,
  CriarServicoInput,
  PecaComEstoqueDto,
  RemocaoResultado,
  ServicoComMetricasDto,
  ServicoDto
} from "../application/catalogo.repository";
import { PrismaEstoqueCatalogoRepository } from "./prisma-estoque-catalogo.repository";
import { PrismaPecaCatalogoRepository } from "./prisma-peca-catalogo.repository";
import { PrismaServicoCatalogoRepository } from "./prisma-servico-catalogo.repository";

export class PrismaCatalogoRepository implements CatalogoRepository {
  private readonly servicos: PrismaServicoCatalogoRepository;
  private readonly pecas: PrismaPecaCatalogoRepository;
  private readonly estoque: PrismaEstoqueCatalogoRepository;

  constructor(prisma: PrismaClient) {
    this.servicos = new PrismaServicoCatalogoRepository(prisma);
    this.pecas = new PrismaPecaCatalogoRepository(prisma);
    this.estoque = new PrismaEstoqueCatalogoRepository(prisma);
  }

  criarServico(input: CriarServicoInput): Promise<ServicoDto> {
    return this.servicos.criarServico(input);
  }

  listarServicos(): Promise<ServicoComMetricasDto[]> {
    return this.servicos.listarServicos();
  }

  atualizarServico(nome: string, input: AtualizarServicoInput): Promise<ServicoDto> {
    return this.servicos.atualizarServico(nome, input);
  }

  removerServico(nome: string): Promise<RemocaoResultado> {
    return this.servicos.removerServico(nome);
  }

  criarPeca(input: CriarPecaInput): Promise<PecaComEstoqueDto> {
    return this.pecas.criarPeca(input);
  }

  listarPecas(): Promise<PecaComEstoqueDto[]> {
    return this.pecas.listarPecas();
  }

  atualizarPeca(nome: string, input: AtualizarPecaInput): Promise<PecaComEstoqueDto> {
    return this.pecas.atualizarPeca(nome, input);
  }

  removerPeca(nome: string): Promise<RemocaoResultado> {
    return this.pecas.removerPeca(nome);
  }

  listarEstoque(apenasBaixo?: boolean): Promise<PecaComEstoqueDto[]> {
    return this.estoque.listarEstoque(apenasBaixo);
  }

  consultarEstoque(nome: string): Promise<PecaComEstoqueDto> {
    return this.estoque.consultarEstoque(nome);
  }

  atualizarEstoque(nome: string, quantidadeDisponivel: number): Promise<PecaComEstoqueDto> {
    return this.estoque.atualizarEstoque(nome, quantidadeDisponivel);
  }
}
