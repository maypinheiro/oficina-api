import { z } from "zod";

const pecaSolicitadaSchema = z.object({
  nome: z.string().min(1),
  quantidade: z.number().int().positive()
});

export const criarOrdemSchema = z.object({
  cpfCnpj: z.string().min(1),
  placa: z.string().min(1),
  descricaoProblemaCliente: z.string().min(1),
  servicos: z.array(z.string().min(1)).min(1),
  pecas: z.array(pecaSolicitadaSchema)
});

export const registrarProblemaSchema = z.object({
  problemaIdentificado: z.string().min(1)
});

export const listarOrdensQuerySchema = z.object({
  status: z
    .enum([
      "RECEBIDA",
      "EM_DIAGNOSTICO",
      "AGUARDANDO_APROVACAO",
      "APROVADA",
      "ORCAMENTO_REJEITADO",
      "EM_EXECUCAO",
      "FINALIZADA",
      "ENTREGUE"
    ])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});
