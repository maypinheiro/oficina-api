import { Router } from "express";

import { asyncHandler } from "../async-handler";
import { PublicController } from "../controllers/public.controller";
import { apresentarDecisaoOrcamento } from "../presenters/orcamento.presenter";
import { apresentarStatusOrdemServico } from "../presenters/ordem-servico.presenter";
import { notificacaoDecisaoSchema } from "./schemas/orcamento.schemas";
import { BillingDecisionGateway } from "../../../contexts/orcamento/infra/billing-decision.gateway";
import { z } from "zod";

const billingDecisionSchema = z.object({ decision: z.enum(["approve", "reject"]) });

export function createPublicRouter(controller: PublicController, billingDecisions: BillingDecisionGateway) {
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
    "/billing/budgets/:numeroOs/decision",
    asyncHandler(async (request, response) => {
      const input = billingDecisionSchema.parse(request.body);
      response.status(200).json(await billingDecisions.decide(String(request.params.numeroOs), input.decision));
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
