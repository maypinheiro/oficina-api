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
    jwt.verify(token, loadEnv().jwtSecret);
    next();
  } catch {
    response.status(401).json({
      message: "Token JWT invalido"
    });
  }
}

