DROP INDEX IF EXISTS "Veiculo_placa_key";
DROP INDEX IF EXISTS "Servico_nome_key";
DROP INDEX IF EXISTS "Peca_nome_key";

CREATE INDEX IF NOT EXISTS "Veiculo_placa_idx" ON "Veiculo"("placa");
CREATE INDEX IF NOT EXISTS "Servico_nome_idx" ON "Servico"("nome");
CREATE INDEX IF NOT EXISTS "Peca_nome_idx" ON "Peca"("nome");
