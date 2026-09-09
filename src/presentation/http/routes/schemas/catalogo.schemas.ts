import { z } from "zod";

export const servicoSchema = z.object({
  nome: z.string().min(1),
  preco: z.number().nonnegative()
});

export const atualizarServicoSchema = servicoSchema.partial().refine((input) => Object.keys(input).length > 0, {
  message: "Informe ao menos um campo para atualizar"
});

export const pecaSchema = z.object({
  nome: z.string().min(1),
  preco: z.number().nonnegative(),
  quantidade: z.number().int().nonnegative(),
  estoqueMinimo: z.number().int().nonnegative().optional()
});

export const atualizarPecaSchema = pecaSchema.partial().refine((input) => Object.keys(input).length > 0, {
  message: "Informe ao menos um campo para atualizar"
});

export const atualizarEstoqueSchema = z.object({
  quantidadeDisponivel: z.number().int().nonnegative()
});
