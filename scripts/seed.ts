import { PrismaClient, StatusOrcamento, StatusOrdemServico } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const seedNumerosOs = [
  "OS-SEED-001",
  "OS-SEED-002",
  "OS-SEED-003",
  "OS-SEED-004",
  "OS-SEED-005",
  "OS-SEED-006",
  "OS-SEED-007"
];

async function main() {
  await limparOrdensSeed();

  const cliente = await prisma.cliente.upsert({
    where: { cpfCnpj: "52998224725" },
    update: {
      nome: "Maria Silva",
      email: "maria@email.com",
      telefone: "11999999999"
    },
    create: {
      nome: "Maria Silva",
      cpfCnpj: "52998224725",
      email: "maria@email.com",
      telefone: "11999999999"
    }
  });

  const veiculo = await buscarOuCriarVeiculo("ABC1D23", "Fiat", "Uno", 2020);

  await prisma.clienteVeiculo.upsert({
    where: { clienteId_veiculoId: { clienteId: cliente.id, veiculoId: veiculo.id } },
    update: {},
    create: { clienteId: cliente.id, veiculoId: veiculo.id }
  });

  const servicoDiagnostico = await buscarOuCriarServico("Diagnostico mecanico", 120);
  const servicoFreio = await buscarOuCriarServico("Troca de pastilha", 150);
  const pecaPastilha = await buscarOuCriarPeca("Pastilha de freio", 90, 12, 3);
  const pecaFiltro = await buscarOuCriarPeca("Filtro de oleo", 45, 2, 3);

  await criarOrdem(cliente.id, veiculo.id, "OS-SEED-001", StatusOrdemServico.RECEBIDA, "Cliente relata ruido leve ao frear.");
  await criarOrdem(cliente.id, veiculo.id, "OS-SEED-002", StatusOrdemServico.EM_DIAGNOSTICO, "Cliente relata vibracao no volante.");
  await criarOrdem(
    cliente.id,
    veiculo.id,
    "OS-SEED-003",
    StatusOrdemServico.AGUARDANDO_APROVACAO,
    "Cliente relata pedal de freio baixo.",
    "Pastilhas gastas e fluido abaixo do nivel.",
    {
      status: StatusOrcamento.PENDENTE,
      servicoId: servicoFreio.id,
      pecaId: pecaPastilha.id,
      quantidadePeca: 1
    }
  );
  await criarOrdem(
    cliente.id,
    veiculo.id,
    "OS-SEED-004",
    StatusOrdemServico.ORCAMENTO_REJEITADO,
    "Cliente relata falha intermitente na partida.",
    "Bateria com baixa carga e filtro saturado.",
    {
      status: StatusOrcamento.REJEITADO,
      servicoId: servicoDiagnostico.id,
      pecaId: pecaFiltro.id,
      quantidadePeca: 1
    }
  );
  await criarOrdem(
    cliente.id,
    veiculo.id,
    "OS-SEED-005",
    StatusOrdemServico.EM_EXECUCAO,
    "Cliente autorizou revisao dos freios.",
    "Substituicao de pastilhas em andamento.",
    {
      status: StatusOrcamento.APROVADO,
      servicoId: servicoFreio.id,
      pecaId: pecaPastilha.id,
      quantidadePeca: 1,
      consumirReserva: true
    }
  );
  await criarOrdem(
    cliente.id,
    veiculo.id,
    "OS-SEED-006",
    StatusOrdemServico.FINALIZADA,
    "Cliente solicitou revisao preventiva.",
    "Servico concluido sem pendencias.",
    {
      status: StatusOrcamento.APROVADO,
      servicoId: servicoDiagnostico.id,
      pecaId: pecaPastilha.id,
      quantidadePeca: 1,
      consumirReserva: true
    }
  );
  await criarOrdem(
    cliente.id,
    veiculo.id,
    "OS-SEED-007",
    StatusOrdemServico.ENTREGUE,
    "Cliente solicitou troca de filtro.",
    "Filtro substituido e veiculo entregue.",
    {
      status: StatusOrcamento.APROVADO,
      servicoId: servicoDiagnostico.id,
      pecaId: pecaFiltro.id,
      quantidadePeca: 1,
      consumirReserva: true
    }
  );

  console.log("Carga inicial criada com OS de exemplo:", seedNumerosOs.join(", "));
}

async function limparOrdensSeed() {
  await prisma.orcamentoPeca.deleteMany({
    where: { orcamento: { ordemServico: { numeroOs: { in: seedNumerosOs } } } }
  });
  await prisma.orcamentoServico.deleteMany({
    where: { orcamento: { ordemServico: { numeroOs: { in: seedNumerosOs } } } }
  });
  await prisma.orcamento.deleteMany({
    where: { ordemServico: { numeroOs: { in: seedNumerosOs } } }
  });
  await prisma.historicoStatusOS.deleteMany({
    where: { ordemServico: { numeroOs: { in: seedNumerosOs } } }
  });
  await prisma.ordemDeServico.deleteMany({
    where: { numeroOs: { in: seedNumerosOs } }
  });
}

async function buscarOuCriarVeiculo(placa: string, marca: string, modelo: string, ano: number) {
  const veiculo = await prisma.veiculo.findFirst({ where: { placa } });

  return veiculo ?? prisma.veiculo.create({ data: { placa, marca, modelo, ano } });
}

async function buscarOuCriarServico(nome: string, preco: number) {
  const servico = await prisma.servico.findFirst({ where: { nome } });

  return servico ?? prisma.servico.create({ data: { nome, preco } });
}

async function buscarOuCriarPeca(nome: string, preco: number, quantidadeDisponivel: number, estoqueMinimo: number) {
  const peca = await prisma.peca.findFirst({ where: { nome }, include: { estoque: true } });

  if (peca) {
    return prisma.peca.update({
      where: { id: peca.id },
      data: {
        preco,
        quantidade: quantidadeDisponivel,
        estoqueMinimo,
        estoque: {
          upsert: {
            create: { quantidadeDisponivel, quantidadeReservada: 0 },
            update: { quantidadeDisponivel, quantidadeReservada: 0 }
          }
        }
      }
    });
  }

  return prisma.peca.create({
    data: {
      nome,
      preco,
      quantidade: quantidadeDisponivel,
      estoqueMinimo,
      estoque: { create: { quantidadeDisponivel, quantidadeReservada: 0 } }
    }
  });
}

async function criarOrdem(
  clienteId: string,
  veiculoId: string,
  numeroOs: string,
  status: StatusOrdemServico,
  descricaoProblemaCliente: string,
  problemaIdentificado?: string,
  orcamento?: {
    status: StatusOrcamento;
    servicoId: string;
    pecaId: string;
    quantidadePeca: number;
    consumirReserva?: boolean;
  }
) {
  const ordem = await prisma.ordemDeServico.create({
    data: {
      numeroOs,
      clienteId,
      veiculoId,
      descricaoProblemaCliente,
      problemaIdentificado,
      status,
      dataFinalizacao: [StatusOrdemServico.FINALIZADA, StatusOrdemServico.ENTREGUE].includes(status) ? new Date() : null,
      historico: {
        create: historicoPara(status).map((item) => ({ status: item }))
      }
    }
  });

  if (!orcamento) {
    return ordem;
  }

  const [servico, peca] = await Promise.all([
    prisma.servico.findUniqueOrThrow({ where: { id: orcamento.servicoId } }),
    prisma.peca.findUniqueOrThrow({ where: { id: orcamento.pecaId } })
  ]);

  await prisma.estoque.update({
    where: { pecaId: peca.id },
    data: {
      quantidadeDisponivel: { decrement: orcamento.quantidadePeca },
      quantidadeReservada: { increment: orcamento.quantidadePeca }
    }
  });

  if (orcamento.consumirReserva) {
    await prisma.estoque.update({
      where: { pecaId: peca.id },
      data: { quantidadeReservada: { decrement: orcamento.quantidadePeca } }
    });
  }

  return prisma.orcamento.create({
    data: {
      ordemServicoId: ordem.id,
      valorTotal: Number(servico.preco) + Number(peca.preco) * orcamento.quantidadePeca,
      status: orcamento.status,
      servicos: {
        create: {
          servicoId: servico.id,
          valor: servico.preco
        }
      },
      pecas: {
        create: {
          pecaId: peca.id,
          quantidade: orcamento.quantidadePeca,
          valorUnitario: peca.preco
        }
      }
    }
  });
}

function historicoPara(status: StatusOrdemServico): StatusOrdemServico[] {
  if (status === StatusOrdemServico.RECEBIDA) {
    return [StatusOrdemServico.RECEBIDA];
  }

  if (status === StatusOrdemServico.EM_DIAGNOSTICO) {
    return [StatusOrdemServico.RECEBIDA, StatusOrdemServico.EM_DIAGNOSTICO];
  }

  if (status === StatusOrdemServico.ORCAMENTO_REJEITADO) {
    return [
      StatusOrdemServico.RECEBIDA,
      StatusOrdemServico.EM_DIAGNOSTICO,
      StatusOrdemServico.AGUARDANDO_APROVACAO,
      StatusOrdemServico.ORCAMENTO_REJEITADO
    ];
  }

  const fluxoAprovado = [
    StatusOrdemServico.RECEBIDA,
    StatusOrdemServico.EM_DIAGNOSTICO,
    StatusOrdemServico.AGUARDANDO_APROVACAO,
    StatusOrdemServico.EM_EXECUCAO,
    StatusOrdemServico.FINALIZADA,
    StatusOrdemServico.ENTREGUE
  ];

  return fluxoAprovado.slice(0, fluxoAprovado.indexOf(status) + 1);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
