import { Router } from "express";
import { SagaStatusQuery } from "../../../contexts/saga/application/saga-status.query";
import { asyncHandler } from "../async-handler";

export function createSagaRouter(query: SagaStatusQuery) {
  const router = Router();
  router.get(
    "/:numeroOs/saga",
    asyncHandler(async (request, response) => {
      response.status(200).json(await query.findByOrderNumber(String(request.params.numeroOs)));
    })
  );
  return router;
}
