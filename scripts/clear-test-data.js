const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("before", await prisma.cliente.count());
  await prisma.historicoStatusOS.deleteMany();
  await prisma.orcamentoPeca.deleteMany();
  await prisma.orcamentoServico.deleteMany();
  await prisma.orcamento.deleteMany();
  await prisma.ordemDeServico.deleteMany();
  await prisma.estoque.deleteMany();
  await prisma.peca.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.clienteVeiculo.deleteMany();
  await prisma.veiculo.deleteMany();
  await prisma.cliente.deleteMany();
  console.log("after", await prisma.cliente.count());
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
