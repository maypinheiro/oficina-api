CREATE TYPE "StatusCliente" AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO');

ALTER TABLE "Cliente"
ADD COLUMN "status" "StatusCliente" NOT NULL DEFAULT 'ATIVO';

CREATE INDEX "Cliente_status_idx" ON "Cliente"("status");
CREATE INDEX "Veiculo_placa_idx" ON "Veiculo"("placa");
CREATE INDEX "Servico_nome_idx" ON "Servico"("nome");
CREATE INDEX "Peca_nome_idx" ON "Peca"("nome");
CREATE INDEX "OrdemDeServico_status_dataCriacao_idx"
ON "OrdemDeServico"("status", "dataCriacao");
CREATE INDEX "OrdemDeServico_clienteId_dataCriacao_idx"
ON "OrdemDeServico"("clienteId", "dataCriacao");
CREATE INDEX "HistoricoStatusOS_ordemServicoId_dataHora_idx"
ON "HistoricoStatusOS"("ordemServicoId", "dataHora");
CREATE INDEX "HistoricoStatusOS_status_dataHora_idx"
ON "HistoricoStatusOS"("status", "dataHora");
