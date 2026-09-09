import { Peca, Prisma, Servico } from "@prisma/client";

import { ApplicationError } from "../application/application-error";

type CatalogoConsultaClient = {
  peca?: {
    findMany(args: { where: { nome: string }; include?: { estoque: true } }): Promise<Array<Peca | PecaComEstoquePrisma>>;
  };
  servico?: {
    findMany(args: { where: { nome: string } }): Promise<Servico[]>;
  };
};

export type PecaComEstoquePrisma = Prisma.PecaGetPayload<{
  include: { estoque: true };
}>;

type MensagensBuscaUnica = {
  naoEncontrado: string;
  duplicado: string;
};

const mensagensServico: MensagensBuscaUnica = {
  naoEncontrado: "Servico nao encontrado",
  duplicado: "Servico duplicado no catalogo; ajuste o cadastro para desambiguar"
};

const mensagensPeca: MensagensBuscaUnica = {
  naoEncontrado: "Peca nao encontrada",
  duplicado: "Peca duplicada no catalogo; ajuste o cadastro para desambiguar"
};

export async function buscarServicoUnicoPorNome(
  prisma: CatalogoConsultaClient,
  nome: string,
  mensagens: MensagensBuscaUnica = mensagensServico
): Promise<Servico> {
  if (!prisma.servico) {
    throw new ApplicationError(500, "Consulta de servico indisponivel");
  }

  const servicos = await prisma.servico.findMany({ where: { nome } });

  validarRegistroUnico(servicos, mensagens);

  return servicos[0];
}

export async function buscarPecaUnicaPorNome(
  prisma: CatalogoConsultaClient,
  nome: string,
  mensagens: MensagensBuscaUnica = mensagensPeca
): Promise<Peca> {
  if (!prisma.peca) {
    throw new ApplicationError(500, "Consulta de peca indisponivel");
  }

  const pecas = await prisma.peca.findMany({ where: { nome } });

  validarRegistroUnico(pecas, mensagens);

  return pecas[0] as Peca;
}

export async function buscarPecaComEstoqueUnicaPorNome(
  prisma: CatalogoConsultaClient,
  nome: string,
  mensagens: MensagensBuscaUnica = mensagensPeca
): Promise<PecaComEstoquePrisma> {
  if (!prisma.peca) {
    throw new ApplicationError(500, "Consulta de peca indisponivel");
  }

  const pecas = await prisma.peca.findMany({
    where: { nome },
    include: { estoque: true }
  });

  validarRegistroUnico(pecas, mensagens);

  return pecas[0] as PecaComEstoquePrisma;
}

function validarRegistroUnico<T>(registros: T[], mensagens: MensagensBuscaUnica): void {
  if (registros.length === 0) {
    throw new ApplicationError(404, mensagens.naoEncontrado);
  }

  if (registros.length > 1) {
    throw new ApplicationError(409, mensagens.duplicado);
  }
}
