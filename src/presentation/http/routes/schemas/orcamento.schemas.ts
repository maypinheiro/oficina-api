import { z } from "zod";

const pecaOrcamentoSchema = z.object({
  nome: z.string().min(1),
  quantidade: z.number().int().positive()
});

export const criarOrcamentoSchema = z.object({
  numeroOs: z.string().min(1),
  servicos: z.array(z.string().min(1)).default([]),
  pecas: z.array(pecaOrcamentoSchema).default([])
});

export const notificacaoDecisaoSchema = z.object({
  numeroOs: z.string().min(1),
  decisao: z.enum(["APROVADO", "REJEITADO"]),
  origem: z.string().min(1).optional()
});
