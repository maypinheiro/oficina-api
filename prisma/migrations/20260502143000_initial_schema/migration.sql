CREATE TYPE "StatusOrdemServico" AS ENUM (
  'RECEBIDA',
  'EM_DIAGNOSTICO',
  'AGUARDANDO_APROVACAO',
  'EM_EXECUCAO',
  'FINALIZADA',
  'ENTREGUE'
);

CREATE TYPE "StatusOrcamento" AS ENUM (
  'PENDENTE',
  'APROVADO',
  'REJEITADO'
);

CREATE TABLE "Cliente" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "cpfCnpj" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telefone" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Veiculo" (
  "id" TEXT NOT NULL,
  "placa" TEXT NOT NULL,
  "marca" TEXT NOT NULL,
  "modelo" TEXT NOT NULL,
  "ano" INTEGER NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Veiculo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClienteVeiculo" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "veiculoId" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClienteVeiculo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrdemDeServico" (
  "id" TEXT NOT NULL,
  "numeroOs" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "veiculoId" TEXT NOT NULL,
  "descricaoProblemaCliente" TEXT NOT NULL,
  "problemaIdentificado" TEXT,
  "status" "StatusOrdemServico" NOT NULL,
  "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataFinalizacao" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrdemDeServico_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HistoricoStatusOS" (
  "id" TEXT NOT NULL,
  "ordemServicoId" TEXT NOT NULL,
  "status" "StatusOrdemServico" NOT NULL,
  "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HistoricoStatusOS_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Orcamento" (
  "id" TEXT NOT NULL,
  "ordemServicoId" TEXT NOT NULL,
  "valorTotal" DECIMAL(10,2) NOT NULL,
  "status" "StatusOrcamento" NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Servico" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "preco" DECIMAL(10,2) NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Servico_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Peca" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "preco" DECIMAL(10,2) NOT NULL,
  "quantidade" INTEGER NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Peca_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Estoque" (
  "pecaId" TEXT NOT NULL,
  "quantidadeDisponivel" INTEGER NOT NULL,
  "quantidadeReservada" INTEGER NOT NULL,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Estoque_pkey" PRIMARY KEY ("pecaId")
);

CREATE TABLE "OrcamentoServico" (
  "id" TEXT NOT NULL,
  "orcamentoId" TEXT NOT NULL,
  "servicoId" TEXT NOT NULL,
  "valor" DECIMAL(10,2) NOT NULL,
  CONSTRAINT "OrcamentoServico_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrcamentoPeca" (
  "id" TEXT NOT NULL,
  "orcamentoId" TEXT NOT NULL,
  "pecaId" TEXT NOT NULL,
  "quantidade" INTEGER NOT NULL,
  "valorUnitario" DECIMAL(10,2) NOT NULL,
  CONSTRAINT "OrcamentoPeca_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Cliente_cpfCnpj_key" ON "Cliente"("cpfCnpj");
CREATE UNIQUE INDEX "OrdemDeServico_numeroOs_key" ON "OrdemDeServico"("numeroOs");
CREATE UNIQUE INDEX "Orcamento_ordemServicoId_key" ON "Orcamento"("ordemServicoId");
CREATE INDEX "Veiculo_placa_idx" ON "Veiculo"("placa");
CREATE INDEX "Servico_nome_idx" ON "Servico"("nome");
CREATE INDEX "Peca_nome_idx" ON "Peca"("nome");

ALTER TABLE "ClienteVeiculo" ADD CONSTRAINT "ClienteVeiculo_clienteId_fkey"
  FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClienteVeiculo" ADD CONSTRAINT "ClienteVeiculo_veiculoId_fkey"
  FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ClienteVeiculo_clienteId_veiculoId_key" ON "ClienteVeiculo"("clienteId", "veiculoId");

ALTER TABLE "OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_clienteId_fkey"
  FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrdemDeServico" ADD CONSTRAINT "OrdemDeServico_veiculoId_fkey"
  FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "HistoricoStatusOS" ADD CONSTRAINT "HistoricoStatusOS_ordemServicoId_fkey"
  FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemDeServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_ordemServicoId_fkey"
  FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemDeServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Estoque" ADD CONSTRAINT "Estoque_pecaId_fkey"
  FOREIGN KEY ("pecaId") REFERENCES "Peca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrcamentoServico" ADD CONSTRAINT "OrcamentoServico_orcamentoId_fkey"
  FOREIGN KEY ("orcamentoId") REFERENCES "Orcamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrcamentoServico" ADD CONSTRAINT "OrcamentoServico_servicoId_fkey"
  FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrcamentoPeca" ADD CONSTRAINT "OrcamentoPeca_orcamentoId_fkey"
  FOREIGN KEY ("orcamentoId") REFERENCES "Orcamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrcamentoPeca" ADD CONSTRAINT "OrcamentoPeca_pecaId_fkey"
  FOREIGN KEY ("pecaId") REFERENCES "Peca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
