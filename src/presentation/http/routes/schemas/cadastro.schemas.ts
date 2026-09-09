import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().min(1),
  cpfCnpj: z.string().min(1),
  email: z.string().min(1),
  telefone: z.string().min(1)
});

export const atualizarClienteSchema = clienteSchema.partial().refine((input) => Object.keys(input).length > 0, {
  message: "Informe ao menos um campo para atualizar"
});

export const veiculoSchema = z.object({
  placa: z.string().min(1),
  marca: z.string().min(1),
  modelo: z.string().min(1),
  ano: z.number().int().min(1900),
  cpfCnpj: z.string().min(1)
});

export const atualizarVeiculoSchema = veiculoSchema.omit({ cpfCnpj: true }).partial().refine((input) => Object.keys(input).length > 0, {
  message: "Informe ao menos um campo para atualizar"
});
