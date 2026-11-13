import { Router } from "express";
import { z } from "zod";
import { BillingOrderIdResolver } from "../../../contexts/orcamento/application/billing-order-id-resolver";
import { BillingDecisionGateway } from "../../../contexts/orcamento/infra/billing-decision.gateway";
import { asyncHandler } from "../async-handler";

const simulationSchema = z.object({ status: z.enum(["approved", "rejected"]) });

export function createBillingRouter(
  billing: BillingDecisionGateway,
  billingOrderIds: BillingOrderIdResolver
) {
  const router = Router();
  router.post(
    "/payments/:numeroOs/simulate",
    asyncHandler(async (request, response) => {
      const input = simulationSchema.parse(request.body);
      const orderId = await billingOrderIds.resolve(String(request.params.numeroOs));
      response.status(200).json(await billing.simulatePayment(orderId, input.status));
    })
  );
  return router;
}
