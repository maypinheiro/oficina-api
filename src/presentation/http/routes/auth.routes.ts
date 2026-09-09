import { Router } from "express";

import { asyncHandler } from "../async-handler";
import { AuthController } from "../controllers/auth.controller";
import { apresentarLogin } from "../presenters/auth.presenter";
import { loginSchema } from "./schemas/auth.schemas";

export function createAuthRouter(controller: AuthController) {
  const router = Router();

  router.post(
    "/login",
    asyncHandler(async (request, response) => {
      const input = loginSchema.parse(request.body);
      response.status(200).json(apresentarLogin(controller.login(input.username, input.password)));
    })
  );

  return router;
}
