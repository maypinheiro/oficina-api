import { Router } from "express";

import { asyncHandler } from "../async-handler";
import { CatalogoController } from "../controllers/catalogo.controller";
import { apresentarCatalogo } from "../presenters/catalogo.presenter";
import {
  atualizarEstoqueSchema,
  atualizarPecaSchema,
  atualizarServicoSchema,
  pecaSchema,
  servicoSchema
} from "./schemas/catalogo.schemas";

export function createServicosRouter(controller: CatalogoController) {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      response.status(201).json(apresentarCatalogo(await controller.criarServico(servicoSchema.parse(request.body))));
    })
  );

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      response.status(200).json(apresentarCatalogo(await controller.listarServicos()));
    })
  );

  router.patch(
    "/:nome",
    asyncHandler(async (request, response) => {
      response.status(200).json(
        apresentarCatalogo(await controller.atualizarServico(String(request.params.nome), atualizarServicoSchema.parse(request.body)))
      );
    })
  );

  router.delete(
    "/:nome",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarCatalogo(await controller.removerServico(String(request.params.nome))));
    })
  );

  return router;
}

export function createPecasRouter(controller: CatalogoController) {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      response.status(201).json(apresentarCatalogo(await controller.criarPeca(pecaSchema.parse(request.body))));
    })
  );

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      response.status(200).json(apresentarCatalogo(await controller.listarPecas()));
    })
  );

  router.patch(
    "/:nome/estoque",
    asyncHandler(async (request, response) => {
      const input = atualizarEstoqueSchema.parse(request.body);

      response.status(200).json(apresentarCatalogo(await controller.atualizarEstoque(String(request.params.nome), input.quantidadeDisponivel)));
    })
  );

  router.patch(
    "/:nome",
    asyncHandler(async (request, response) => {
      response.status(200).json(
        apresentarCatalogo(await controller.atualizarPeca(String(request.params.nome), atualizarPecaSchema.parse(request.body)))
      );
    })
  );

  router.delete(
    "/:nome",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarCatalogo(await controller.removerPeca(String(request.params.nome))));
    })
  );

  return router;
}
