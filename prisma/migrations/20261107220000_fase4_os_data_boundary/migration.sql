CREATE TYPE "StatusSaga" AS ENUM (
  'INICIADA', 'EM_ANDAMENTO', 'AGUARDANDO_EVENTO', 'COMPENSANDO',
  'COMPENSADA', 'CONCLUIDA', 'FALHOU'
);

CREATE TYPE "StatusOutbox" AS ENUM ('PENDENTE', 'PUBLICADA', 'FALHOU');

ALTER TABLE "OrdemDeServico"
  ADD COLUMN "billingQuoteId" TEXT,
  ADD COLUMN "executionId" TEXT,
  ADD COLUMN "paymentId" TEXT;

CREATE TABLE "SagaInstancia" (
  "id" TEXT NOT NULL,
  "ordemServicoId" TEXT NOT NULL,
  "status" "StatusSaga" NOT NULL DEFAULT 'INICIADA',
  "etapaAtual" TEXT NOT NULL,
  "versao" INTEGER NOT NULL DEFAULT 0,
  "correlationId" TEXT NOT NULL,
  "deadline" TIMESTAMP(3),
  "ultimoErro" TEXT,
  "iniciadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  "finalizadoEm" TIMESTAMP(3),
  CONSTRAINT "SagaInstancia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OutboxMensagem" (
  "id" TEXT NOT NULL,
  "aggregateId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "versao" INTEGER NOT NULL DEFAULT 1,
  "payload" JSONB NOT NULL,
  "correlationId" TEXT NOT NULL,
  "sagaId" TEXT,
  "status" "StatusOutbox" NOT NULL DEFAULT 'PENDENTE',
  "tentativas" INTEGER NOT NULL DEFAULT 0,
  "proximaTentativaEm" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publicadoEm" TIMESTAMP(3),
  CONSTRAINT "OutboxMensagem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InboxMensagem" (
  "messageId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "sagaId" TEXT,
  "payloadHash" TEXT NOT NULL,
  "processadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InboxMensagem_pkey" PRIMARY KEY ("messageId")
);

CREATE UNIQUE INDEX "SagaInstancia_ordemServicoId_key" ON "SagaInstancia"("ordemServicoId");
CREATE UNIQUE INDEX "SagaInstancia_correlationId_key" ON "SagaInstancia"("correlationId");
CREATE INDEX "SagaInstancia_status_atualizadoEm_idx" ON "SagaInstancia"("status", "atualizadoEm");
CREATE INDEX "OutboxMensagem_status_proximaTentativaEm_criadoEm_idx" ON "OutboxMensagem"("status", "proximaTentativaEm", "criadoEm");
CREATE INDEX "OutboxMensagem_aggregateId_criadoEm_idx" ON "OutboxMensagem"("aggregateId", "criadoEm");
CREATE INDEX "InboxMensagem_correlationId_processadoEm_idx" ON "InboxMensagem"("correlationId", "processadoEm");

ALTER TABLE "SagaInstancia" ADD CONSTRAINT "SagaInstancia_ordemServicoId_fkey"
  FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemDeServico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
