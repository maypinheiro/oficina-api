import { Router } from "express";

import { asyncHandler } from "../async-handler";
import { PublicController } from "../controllers/public.controller";
import { apresentarDecisaoOrcamento } from "../presenters/orcamento.presenter";
import { apresentarStatusOrdemServico } from "../presenters/ordem-servico.presenter";
import { notificacaoDecisaoSchema } from "./schemas/orcamento.schemas";

export function createPublicRouter(controller: PublicController) {
  const router = Router();

  router.get(
    "/ordens-servico/:numeroOs/status",
    asyncHandler(async (request, response) => {
      response.status(200).json(
        apresentarStatusOrdemServico(await controller.consultarStatusOrdemServico(String(request.params.numeroOs)))
      );
    })
  );

  router.post(
    "/orcamentos/notificacoes/aprovacao",
    asyncHandler(async (request, response) => {
      const input = notificacaoDecisaoSchema.parse(request.body);

      response.status(200).json(apresentarDecisaoOrcamento(await controller.notificarDecisaoOrcamento(input.numeroOs, input.decisao)));
    })
  );

  return router;
}
