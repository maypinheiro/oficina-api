import { Router } from "express";
import { HealthController } from "../controllers/health.controller";
import { apresentarHealth } from "../presenters/health.presenter";

export function createHealthRouter(controller: HealthController) {
  const router = Router();

  router.get("/", (_request, response) => {
    response.status(200).json(apresentarHealth(controller.status()));
  });

  return router;
}
