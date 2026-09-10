import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { loadEnv } from "../../../shared/config/env";

export function authenticate(request: Request, response: Response, next: NextFunction): void {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({
      message: "Token JWT obrigatorio"
    });
    return;
  }

  try {
    const token = authorization.replace("Bearer ", "");
    const env = loadEnv();
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || decoded.header.alg === "none") throw new Error("Algoritmo invalido");

    if (decoded.header.alg === "RS256" && env.jwtPublicKeyBase64) {
      const publicKey = Buffer.from(env.jwtPublicKeyBase64, "base64").toString("utf8");
      const payload = jwt.verify(token, publicKey, {
        algorithms: ["RS256"],
        issuer: env.jwtIssuer,
        audience: env.jwtAudience
      });
      if (typeof payload === "string" || payload.scope !== "cliente" || !payload.sub) {
        throw new Error("Identidade de cliente invalida");
      }
    } else if (decoded.header.alg === "HS256") {
      jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    } else {
      throw new Error("Algoritmo nao permitido");
    }
    next();
  } catch {
    response.status(401).json({
      message: "Token JWT invalido"
    });
  }
}
