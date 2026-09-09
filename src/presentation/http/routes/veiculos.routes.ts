import { Router } from "express";

import { asyncHandler } from "../async-handler";
import { VeiculoController } from "../controllers/veiculo.controller";
import { apresentarCadastro } from "../presenters/cadastro.presenter";
import { atualizarVeiculoSchema, veiculoSchema } from "./schemas/cadastro.schemas";

export function createVeiculosRouter(controller: VeiculoController) {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      response.status(201).json(apresentarCadastro(await controller.criarVeiculo(veiculoSchema.parse(request.body))));
    })
  );

  router.get(
    "/",
    asyncHandler(async (_request, response) => {
      response.status(200).json(apresentarCadastro(await controller.listarVeiculos()));
    })
  );

  router.patch(
    "/:placa",
    asyncHandler(async (request, response) => {
      response.status(200).json(
        apresentarCadastro(await controller.atualizarVeiculo(String(request.params.placa), atualizarVeiculoSchema.parse(request.body)))
      );
    })
  );

  router.delete(
    "/:placa",
    asyncHandler(async (request, response) => {
      response.status(200).json(apresentarCadastro(await controller.removerVeiculo(String(request.params.placa))));
    })
  );

  return router;
}
