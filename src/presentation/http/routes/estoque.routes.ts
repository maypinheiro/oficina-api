import { Router } from "express";

import { asyncHandler } from "../async-handler";
import { EstoqueController } from "../controllers/estoque.controller";
import { apresentarEstoque } from "../presenters/estoque.presenter";
import { atualizarEstoqueSchema } from "./schemas/catalogo.schemas";
import { liberarReservasOsSchema, listarEstoqueQuerySchema, movimentarEstoqueSchema } from "./schemas/estoque.schemas";

export function createEstoqueRouter(controller: EstoqueController) {
  const router = Router();

  router.get(
    "/pecas",
    asyncHandler(async (request, response) => {
      const query = listarEstoqueQuerySchema.parse(request.query);

      response.status(200).json(apresentarEstoque(await controller.listarEstoque(query.baixo)));
    })
  );

  router.get(
    "/pecas/:nome",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarEstoque(await controller.consultarEstoque(String(request.params.nome))));
    })
  );

  router.patch(
    "/pecas/:nome",
    asyncHandler(async (request, response) => {
      const input = atualizarEstoqueSchema.parse(request.body);

      response.status(200).json(apresentarEstoque(await controller.atualizarEstoque(String(request.params.nome), input.quantidadeDisponivel)));
    })
  );

  router.post(
    "/reservas",
    asyncHandler(async (request, response) => {
      const input = movimentarEstoqueSchema.parse(request.body);

      response.status(200).json(apresentarEstoque(await controller.reservarPeca(input.nome, input.quantidade)));
    })
  );

  router.post(
    "/reservas/liberar",
    asyncHandler(async (request, response) => {
      const input = movimentarEstoqueSchema.parse(request.body);

      response.status(200).json(apresentarEstoque(await controller.liberarPecaReservada(input.nome, input.quantidade)));
    })
  );

  router.post(
    "/reservas/liberar-os",
    asyncHandler(async (request, response) => {
      const input = liberarReservasOsSchema.parse(request.body);

      response.status(200).json(apresentarEstoque(await controller.liberarReservasDaOs(input.numeroOs)));
    })
  );

  router.post(
    "/consumos",
    asyncHandler(async (request, response) => {
      const input = movimentarEstoqueSchema.parse(request.body);

      response.status(200).json(apresentarEstoque(await controller.consumirPeca(input.nome, input.quantidade)));
    })
  );

  return router;
}
