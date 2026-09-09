import { Router } from "express";

import { asyncHandler } from "../async-handler";
import { OrcamentoController } from "../controllers/orcamento.controller";
import { apresentarDecisaoOrcamento, apresentarOrcamento } from "../presenters/orcamento.presenter";
import { criarOrcamentoSchema, notificacaoDecisaoSchema } from "./schemas/orcamento.schemas";

export function createOrcamentosRouter(controller: OrcamentoController) {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const input = criarOrcamentoSchema.parse(request.body);
      const orcamento = await controller.criar(input);

      response.status(201).json(apresentarOrcamento(orcamento));
    })
  );

  router.post(
    "/notificacoes/aprovacao",
    asyncHandler(async (request, response) => {
      const input = notificacaoDecisaoSchema.parse(request.body);
      const atualizado = await controller.notificarDecisao(input.numeroOs, input.decisao);

      response.status(200).json(apresentarDecisaoOrcamento(atualizado));
    })
  );

  router.patch(
    "/:numeroOs/aprovar",
    asyncHandler(async (request, response) => {
      const atualizado = await controller.aprovar(String(request.params.numeroOs));

      response.status(200).json(apresentarDecisaoOrcamento(atualizado));
    })
  );

  router.patch(
    "/:numeroOs/rejeitar",
    asyncHandler(async (request, response) => {
      const atualizado = await controller.rejeitar(String(request.params.numeroOs));

      response.status(200).json(apresentarDecisaoOrcamento(atualizado));
    })
  );

  return router;
}
