import { Router } from "express";
import { SagaStatusQuery } from "../../../contexts/saga/application/saga-status.query";
import { asyncHandler } from "../async-handler";
import { SagaFailureSimulator } from "../../../contexts/saga/application/saga-failure-simulator";
import { ApplicationError } from "../../../shared/application/application-error";

export function createSagaRouter(query: SagaStatusQuery, failureSimulator?: SagaFailureSimulator) {
  const router = Router();
  router.post(
    "/:numeroOs/saga/simulate-execution-failure",
    asyncHandler(async (request, response) => {
      if (!failureSimulator) throw new ApplicationError(404, "Simulacao de falha indisponivel");
      response.status(202).json(await failureSimulator.simulateExecutionFailure(String(request.params.numeroOs)));
    })
  );
  router.get(
    "/:numeroOs/saga",
    asyncHandler(async (request, response) => {
      response.status(200).json(await query.findByOrderNumber(String(request.params.numeroOs)));
    })
  );
  return router;
}
