import { Prisma } from "@prisma/client";

export const clienteComVeiculosInclude = {
  veiculos: true
} satisfies Prisma.ClienteInclude;

export const veiculoComClientesInclude = {
  clientes: { include: { cliente: true } }
} satisfies Prisma.VeiculoInclude;
