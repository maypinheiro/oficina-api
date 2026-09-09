import jwt from "jsonwebtoken";

import { loadEnv } from "../../../shared/config/env";
import { HttpError } from "../http-error";

export class AuthController {
  login(username: string, password: string) {
    const env = loadEnv();

    if (username !== env.adminUsername || password !== env.adminPassword) {
      throw new HttpError(401, "Credenciais invalidas");
    }

    const token = jwt.sign({ sub: username, role: "admin" }, env.jwtSecret, {
      expiresIn: "8h"
    });

    return {
      token,
      tokenType: "Bearer",
      expiresIn: "8h"
    };
  }
}
