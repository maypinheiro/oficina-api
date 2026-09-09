CREATE TABLE IF NOT EXISTS "ClienteVeiculo" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "veiculoId" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClienteVeiculo_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'Veiculo'
      AND c.column_name = 'clienteId'
  ) THEN
    EXECUTE '
      INSERT INTO "ClienteVeiculo" ("id", "clienteId", "veiculoId")
      SELECT gen_random_uuid()::text, v."clienteId", v."id"
      FROM "Veiculo" v
      WHERE v."clienteId" IS NOT NULL
      ON CONFLICT DO NOTHING
    ';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ClienteVeiculo_clienteId_fkey'
  ) THEN
    ALTER TABLE "ClienteVeiculo" ADD CONSTRAINT "ClienteVeiculo_clienteId_fkey"
      FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ClienteVeiculo_veiculoId_fkey'
  ) THEN
    ALTER TABLE "ClienteVeiculo" ADD CONSTRAINT "ClienteVeiculo_veiculoId_fkey"
      FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "ClienteVeiculo_clienteId_veiculoId_key" ON "ClienteVeiculo"("clienteId", "veiculoId");

ALTER TABLE "Veiculo" DROP CONSTRAINT IF EXISTS "Veiculo_clienteId_fkey";
ALTER TABLE "Veiculo" DROP COLUMN IF EXISTS "clienteId";
