import { Router } from "express";

import { asyncHandler } from "../async-handler";
import { MetricasController } from "../controllers/metricas.controller";
import { apresentarMetricas } from "../presenters/metricas.presenter";

export function createMetricasRouter(controller: MetricasController) {
  const router = Router();

  router.get(
    "/tempo-medio",
    asyncHandler(async (_request, response) => {
      response.status(200).json(apresentarMetricas(await controller.calcularTempoMedioOrdens()));
    })
  );

  router.get(
    "/tempo-medio-servicos",
    asyncHandler(async (_request, response) => {
      response.status(200).json(apresentarMetricas(await controller.calcularTempoMedioServicos()));
    })
  );

  return router;
}
