import { z } from "zod";

export const movimentarEstoqueSchema = z.object({
  nome: z.string().min(1),
  quantidade: z.number().int().positive()
});

export const liberarReservasOsSchema = z.object({
  numeroOs: z.string().min(1)
});

export const listarEstoqueQuerySchema = z.object({
  baixo: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true")
});
